// SMS Configuration
// For production, use environment variables or a secure config management system

module.exports = {
  twilio: {
    // Replace these with your actual Twilio credentials
    // You can get these from https://console.twilio.com/
    accountSid: process.env.TWILIO_ACCOUNT_SID || 'your_twilio_account_sid_here',
    authToken: process.env.TWILIO_AUTH_TOKEN || 'your_twilio_auth_token_here',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || 'your_twilio_phone_number_here', // Format: +1234567890
  },
  
  // SMS provider selection
  provider: process.env.SMS_PROVIDER || 'twilio', // Options: 'twilio', 'mock'
  
  // Rate limiting (optional)
  rateLimit: {
    maxMessagesPerHour: 100,
    maxMessagesPerDay: 500
  },
  
  // Message settings
  settings: {
    maxMessageLength: 1600, // Twilio supports up to 1600 characters
    enableDeliveryReceipts: true,
    defaultCountryCode: '+63' // Philippines
  }
};
