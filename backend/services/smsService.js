const twilio = require('twilio');
const smsConfig = require('../config/sms.config');

class SMSService {
  constructor() {
    this.config = smsConfig;
    this.twilioClient = null;
    this.initializeTwilio();
  }

  initializeTwilio() {
    try {
      if (this.config.provider === 'twilio') {
        // Only initialize if credentials are provided
        if (this.config.twilio.accountSid !== 'your_twilio_account_sid_here' && 
            this.config.twilio.authToken !== 'your_twilio_auth_token_here') {
          this.twilioClient = twilio(this.config.twilio.accountSid, this.config.twilio.authToken);
          console.log('[SMS Service] Twilio client initialized successfully');
        } else {
          console.log('[SMS Service] Twilio credentials not configured - using mock mode');
        }
      }
    } catch (error) {
      console.error('[SMS Service] Error initializing Twilio:', error.message);
    }
  }

  // Format Philippine phone numbers for international format
  formatPhoneNumber(phoneNumber) {
    let cleaned = phoneNumber.replace(/\s+/g, '').replace(/[^\d+]/g, '');
    
    // Handle Philippine numbers
    if (cleaned.startsWith('09')) {
      // Convert 09xxxxxxxxx to +639xxxxxxxxx
      cleaned = '+63' + cleaned.substring(1);
    } else if (cleaned.startsWith('639')) {
      // Add + if missing
      cleaned = '+' + cleaned;
    } else if (!cleaned.startsWith('+63') && cleaned.length === 10 && cleaned.startsWith('9')) {
      // Handle 9xxxxxxxxx format
      cleaned = '+63' + cleaned;
    }
    
    return cleaned;
  }

  // Validate Philippine phone number
  validatePhoneNumber(phoneNumber) {
    const formatted = this.formatPhoneNumber(phoneNumber);
    // Philippine mobile numbers: +639xxxxxxxxx (Globe, Smart, Sun, etc.)
    const philippineRegex = /^\+639[0-9]{9}$/;
    return philippineRegex.test(formatted);
  }

  // Send SMS using Twilio
  async sendTwilioSMS(to, message, options = {}) {
    if (!this.twilioClient) {
      throw new Error('Twilio client not initialized. Please check your credentials.');
    }

    const formattedNumber = this.formatPhoneNumber(to);
    
    if (!this.validatePhoneNumber(to)) {
      throw new Error(`Invalid Philippine phone number format: ${to}`);
    }

    try {
      const messageOptions = {
        body: message,
        from: this.config.twilio.phoneNumber,
        to: formattedNumber,
        ...options
      };

      // Add delivery status callback if enabled
      if (this.config.settings.enableDeliveryReceipts) {
        messageOptions.statusCallback = `${process.env.BASE_URL || 'http://localhost:5000'}/api/sms-status`;
      }

      console.log('[SMS Service] Sending SMS via Twilio:', {
        to: formattedNumber,
        from: this.config.twilio.phoneNumber,
        messageLength: message.length
      });

      const result = await this.twilioClient.messages.create(messageOptions);
      
      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        to: result.to,
        from: result.from,
        provider: 'twilio',
        cost: result.price || 'N/A',
        direction: result.direction
      };
    } catch (error) {
      console.error('[SMS Service] Twilio SMS error:', error);
      throw new Error(`Twilio SMS failed: ${error.message}`);
    }
  }

  // Mock SMS sending for development/testing
  async sendMockSMS(to, message, options = {}) {
    const formattedNumber = this.formatPhoneNumber(to);
    
    if (!this.validatePhoneNumber(to)) {
      throw new Error(`Invalid Philippine phone number format: ${to}`);
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Mock SMS delivery failed (simulated network error)');
    }

    console.log('[SMS Service] Mock SMS sent:', {
      to: formattedNumber,
      messageLength: message.length,
      urgency: options.urgency || 'normal'
    });

    return {
      success: true,
      messageId: `mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      status: 'delivered',
      to: formattedNumber,
      from: '+15551234567', // Mock Twilio number
      provider: 'mock',
      cost: '$0.075', // Typical SMS cost
      direction: 'outbound-api'
    };
  }

  // Main SMS sending method
  async sendSMS(to, message, options = {}) {
    try {
      // Validate message length
      if (message.length > this.config.settings.maxMessageLength) {
        throw new Error(`Message too long. Max length: ${this.config.settings.maxMessageLength} characters`);
      }

      let result;
      
      if (this.config.provider === 'twilio' && this.twilioClient) {
        result = await this.sendTwilioSMS(to, message, options);
      } else {
        console.log('[SMS Service] Using mock SMS (Twilio not configured)');
        result = await this.sendMockSMS(to, message, options);
      }

      return result;
    } catch (error) {
      console.error('[SMS Service] SMS sending failed:', error);
      throw error;
    }
  }

  // Get service status
  getStatus() {
    return {
      provider: this.config.provider,
      twilioConfigured: !!this.twilioClient,
      ready: this.config.provider === 'mock' || !!this.twilioClient
    };
  }
}

// Create singleton instance
const smsService = new SMSService();

module.exports = smsService;
