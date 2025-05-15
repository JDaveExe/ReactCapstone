const db = require('./config/db.config');

console.log('Running database consistency check...');

// Check families table
db.query('SELECT * FROM families', (err, families) => {
  if (err) {
    console.error('Error querying families:', err);
    return;
  }
  
  console.log(`Found ${families.length} families:`);
  families.forEach(f => {
    console.log(`  ID: ${f.id} (${typeof f.id}), Name: ${f.familyName}`);
  });
  
  // Check users with family assignments
  db.query('SELECT u.id, u.firstName, u.lastName, u.familyId, f.familyName FROM users u LEFT JOIN families f ON u.familyId = f.id', (err, users) => {
    if (err) {
      console.error('Error querying users with families:', err);
      return;
    }
    
    console.log(`\nFound ${users.length} users:`);
    users.forEach(u => {
      console.log(`  User ID: ${u.id}, Name: ${u.firstName} ${u.lastName}, FamilyID: ${u.familyId} (${typeof u.familyId}), Family: ${u.familyName || 'None'}`);
    });
    
    // Check for inconsistencies - users with familyId that doesn't match any family
    const familyIds = new Set(families.map(f => f.id));
    const usersWithBadFamilyId = users.filter(u => u.familyId !== null && !familyIds.has(u.familyId));
    
    if (usersWithBadFamilyId.length > 0) {
      console.log('\n⚠️ FOUND INCONSISTENCIES:');
      usersWithBadFamilyId.forEach(u => {
        console.log(`  User ${u.firstName} ${u.lastName} (ID: ${u.id}) has familyId=${u.familyId} which doesn't exist in families table`);
      });
    } else {
      console.log('\n✅ No inconsistencies found in family assignments');
    }
    
    db.end();
  });
});
