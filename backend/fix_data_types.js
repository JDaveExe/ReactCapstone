const db = require('./config/db.config');

console.log('Starting database type consistency check and fix...');

// Check and fix familyId references
db.query('SELECT * FROM families', (err, families) => {
  if (err) {
    console.error('Error querying families:', err);
    return process.exit(1);
  }
  
  console.log(`Found ${families.length} families:`);
  families.forEach(f => {
    console.log(`  ID: ${f.id} (${typeof f.id}), Name: ${f.familyName}`);
  });
  
  // Check users with family assignments
  db.query('SELECT id, firstName, lastName, familyId FROM users WHERE familyId IS NOT NULL', (err, users) => {
    if (err) {
      console.error('Error querying users with families:', err);
      return process.exit(1);
    }
    
    console.log(`\nFound ${users.length} users with family assignments:`);
    
    // Perform update for each user to ensure familyId is consistently stored as a number
    let updateCount = 0;
    let errorCount = 0;
    let processingCount = 0;
    
    if (users.length === 0) {
      console.log('No users with familyId found. Nothing to fix.');
      db.end();
      return;
    }
    
    // Process each user to ensure familyId is numeric
    users.forEach(user => {
      const userId = user.id;
      const currentFamilyId = user.familyId;
      const numericFamilyId = parseInt(currentFamilyId, 10);
      
      console.log(`  User ID: ${userId}, Name: ${user.firstName} ${user.lastName}, Current familyId: ${currentFamilyId} (${typeof currentFamilyId})`);
      
      // If the familyId is not already a number or the parsed number is different from the original
      if (typeof currentFamilyId !== 'number' || currentFamilyId !== numericFamilyId) {
        console.log(`    ⚠️ Converting familyId from ${currentFamilyId} to ${numericFamilyId}`);
        
        db.query('UPDATE users SET familyId = ? WHERE id = ?', [numericFamilyId, userId], (updateErr) => {
          processingCount++;
          
          if (updateErr) {
            console.error(`    ❌ Error updating user ${userId}:`, updateErr);
            errorCount++;
          } else {
            console.log(`    ✅ Updated familyId for user ${userId} to ${numericFamilyId}`);
            updateCount++;
          }
          
          // Check if we're done processing all users
          if (processingCount === users.length) {
            console.log(`\nDone! Updated ${updateCount} users, encountered ${errorCount} errors.`);
            
            // Verify the fix
            db.query('SELECT id, firstName, lastName, familyId FROM users WHERE familyId IS NOT NULL', (verifyErr, verifyUsers) => {
              if (verifyErr) {
                console.error('Error verifying fixes:', verifyErr);
              } else {
                console.log('\nVerification: Current users with family assignments:');
                verifyUsers.forEach(u => {
                  console.log(`  User ID: ${u.id}, familyId: ${u.familyId} (${typeof u.familyId})`);
                });
              }
              db.end();
            });
          }
        });
      } else {
        console.log(`    ✓ familyId already correctly typed as number: ${currentFamilyId}`);
        processingCount++;
        
        // Check if we're done processing all users
        if (processingCount === users.length) {
          console.log(`\nDone! All familyId values are already correctly typed as numbers.`);
          db.end();
        }
      }
    });
  });
});
