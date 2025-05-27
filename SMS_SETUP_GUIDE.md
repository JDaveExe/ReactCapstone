# SMS Service Setup Guide

## Real SMS Integration with Twilio

The SMS notification system now supports real SMS sending via Twilio, the most popular SMS service provider.

### Quick Setup (Development - Mock Mode)

The system works out of the box in **mock mode** for development and testing:
- No configuration required
- Simulates SMS sending with realistic delays
- Validates Philippine phone numbers (09xxxxxxxx format)
- Logs all SMS attempts for debugging

### Production Setup (Real SMS)

To send real SMS messages:

#### 1. Create Twilio Account
1. Go to [https://www.twilio.com](https://www.twilio.com)
2. Sign up for a free account (includes $15 credit)
3. Verify your phone number

#### 2. Get Twilio Credentials
1. Go to [Twilio Console](https://console.twilio.com/)
2. Copy your **Account SID** and **Auth Token**
3. Get a Twilio phone number:
   - Go to Phone Numbers → Manage → Buy a number
   - Choose a number (US numbers work for international SMS)

#### 3. Configure Environment Variables
1. Copy `backend/.env.example` to `backend/.env`
2. Fill in your credentials:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
SMS_PROVIDER=twilio
```

#### 4. Restart Backend Server
```bash
cd backend
npm restart
```

### Features

✅ **Real SMS Sending**: Uses Twilio API for actual SMS delivery
✅ **Philippine Numbers**: Supports 09xxxxxxxx format (converts to +639xxxxxxxx)
✅ **Message Templates**: Pre-defined health center messages
✅ **Delivery Receipts**: Tracks message delivery status
✅ **Rate Limiting**: Prevents spam/abuse
✅ **Error Handling**: Graceful fallback to mock mode
✅ **Cost Tracking**: Logs SMS costs for billing

### Phone Number Formats Supported

- `09171234567` → `+639171234567`
- `+639171234567` → `+639171234567`
- `639171234567` → `+639171234567`
- `9171234567` → `+639171234567`

### API Endpoints

- `POST /api/send-sms` - Send SMS notification
- `GET /api/sms-status` - Check SMS service status
- `POST /api/sms-delivery-status` - Webhook for delivery receipts

### Cost Information

- **Twilio Pricing**: ~$0.075 per SMS to Philippines
- **Free Trial**: $15 credit (≈200 SMS messages)
- **Production**: Pay-as-you-use pricing

### Security Notes

- Never commit real credentials to version control
- Use environment variables for production
- Consider rate limiting for public endpoints
- Monitor usage to prevent abuse

### Troubleshooting

1. **"Twilio client not initialized"**
   - Check your credentials in `.env`
   - Ensure SMS_PROVIDER=twilio

2. **"Invalid phone number"**
   - Use Philippine format: 09xxxxxxxx
   - Check for proper digits (11 total)

3. **Mock mode instead of real SMS**
   - System automatically falls back to mock if Twilio not configured
   - Check console logs for configuration status

### Testing

1. **Mock Mode**: Works immediately, check browser console
2. **Real SMS**: Send to your verified phone number first
3. **Status Check**: Use `/api/sms-status` endpoint

For support, check Twilio documentation or console logs for detailed error messages.
