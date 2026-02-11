# Notification Settings & Customer Login Configuration

## Overview
The settings page now has comprehensive notification channel configuration and customer authentication method controls.

## What Changed

### 1. Settings Page Refactoring

#### Notifications Tab (Formerly "WhatsApp Integration")
The WhatsApp tab has been renamed to "Notifications" and now includes three collapsible sections:

**Email Notifications** 📧
- Toggle: Enable/Disable email notifications
- Settings (shown when enabled):
  - Email User (Gmail address)
  - Email Password (App-specific password)
- Used for: OTP delivery, order notifications

**WhatsApp Notifications** 💬
- Toggle: Enable/Disable WhatsApp notifications
- Settings (shown when enabled):
  - API URL
  - API Key
  - Phone Number ID
- Used for: Order notifications, OTP delivery (if SMS fails)

**SMS OTP** 📱
- Toggle: Enable/Disable SMS OTP
- Settings (shown when enabled):
  - API URL
  - API Key
- Used for: OTP delivery via SMS provider
- Note: SMS integration is ready but requires provider setup (Twilio, etc.)

#### Customer Login Tab 🔐
New tab to control customer authentication methods:
- **OTP Login**: Toggle to enable/disable OTP-based login
- **Password Login**: Toggle to enable/disable password-based login
- At least one method must be enabled for customers to log in

### 2. Dynamic Customer Login Page

The customer login page now adapts based on settings:

**Both Methods Enabled:**
- Shows toggle buttons to switch between "Login with OTP" and "Login with Password"
- Users can choose their preferred method

**Only OTP Enabled:**
- Only shows OTP login form (no toggle)

**Only Password Enabled:**
- Only shows password login form (no toggle)

**Neither Enabled:**
- Login page will show but forms will be hidden

### 3. Smart OTP Delivery

The send-otp API now checks settings to determine which channel to use:

**For Email Login:**
- Uses email OTP if email notifications are enabled

**For Phone Login (Priority Order):**
1. **WhatsApp** - If WhatsApp notifications enabled and number available
2. **SMS** - If SMS OTP enabled (requires SMS provider setup)
3. **Email** - If email notifications enabled and customer has email
4. **Console** - Debug fallback (shows in API response)

### 4. Conditional Order Notifications

Sales notifications now respect settings:
- WhatsApp order notifications only sent if "WhatsApp Notifications" is enabled
- No more notifications if the feature is turned off

## Configuration API

New endpoint: `/api/customer-auth/config`

Returns:
```json
{
  "otpEnabled": true,
  "passwordEnabled": true,
  "emailNotifications": true,
  "whatsappNotifications": false,
  "smsOtp": false
}
```

This allows the customer login page to show only enabled methods.

## Database Settings Keys

The following settings keys are used:

| Key | Type | Description |
|-----|------|-------------|
| `email_notifications_enabled` | boolean | Enable email OTP/notifications |
| `email_user` | string | Gmail address |
| `email_pass` | string | Gmail app password |
| `whatsapp_enabled` | boolean | Enable WhatsApp notifications |
| `whatsapp_api_url` | string | WhatsApp API endpoint |
| `whatsapp_api_key` | string | WhatsApp API key |
| `whatsapp_phone_id` | string | WhatsApp Phone Number ID |
| `sms_otp_enabled` | boolean | Enable SMS OTP |
| `sms_api_url` | string | SMS provider API URL |
| `sms_api_key` | string | SMS provider API key |
| `customer_otp_login_enabled` | boolean | Enable OTP login for customers |
| `customer_password_login_enabled` | boolean | Enable password login for customers |

## How to Use

### Setup Email OTP (FREE)
1. Go to Settings → Notifications → Email Notifications
2. Toggle ON
3. Enter your Gmail address
4. Generate and enter an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Generate password for "Mail"
   - Paste the 16-character password
5. Click "Save Settings"

### Setup WhatsApp Notifications (Paid)
1. Go to Settings → Notifications → WhatsApp Notifications
2. Toggle ON
3. Sign up for WhatsApp Business API (Meta or third-party provider)
4. Enter API credentials
5. Click "Save Settings"

### Setup SMS OTP (Requires Provider)
1. Sign up for SMS provider (Twilio, etc.)
2. Go to Settings → Notifications → SMS OTP
3. Toggle ON
4. Enter API credentials
5. Click "Save Settings"
6. Note: Code integration required for SMS provider

### Configure Customer Login Methods
1. Go to Settings → Customer Login
2. Toggle ON the methods you want to enable:
   - OTP Login (sends OTP via configured channels)
   - Password Login (traditional username/password)
3. Click "Save Settings"
4. Customer login page will automatically update

## Testing

### Test Customer Login:
1. Enable at least one login method in Settings → Customer Login
2. Visit `/customer-login`
3. Verify only enabled methods are shown
4. Test OTP flow (if enabled)
5. Test password flow (if enabled)

### Test OTP Delivery:
1. Enable notification channel in Settings → Notifications
2. Try logging in with OTP
3. Check email/WhatsApp/SMS (depending on what's enabled)
4. OTP is also shown in API response for debugging

### Test Order Notifications:
1. Enable WhatsApp in Settings → Notifications
2. Create a sale with customer phone/WhatsApp
3. Check if notification is sent
4. Disable WhatsApp and verify no notification is sent

## Benefits

✅ **Flexible Configuration**: Enable/disable notification channels as needed
✅ **Dynamic UI**: Login page adapts to settings automatically
✅ **Cost Control**: Only use paid services when enabled
✅ **Free Email OTP**: Gmail SMTP requires no additional costs
✅ **Smart Fallback**: OTP tries multiple channels in priority order
✅ **Conditional Features**: Turn off WhatsApp notifications without breaking app
✅ **User Choice**: Let customers choose between OTP and password login

## Notes

- At least one customer login method should be enabled
- Email notifications use Gmail SMTP (FREE)
- WhatsApp requires paid API subscription
- SMS requires provider integration (Twilio, etc.)
- OTP debugging info is shown in API response (remove in production)
- Customer login page shows loading state while fetching config
- Settings are stored in database and take effect immediately

## Future Enhancements

- Add SMS provider integration (Twilio)
- Add email notifications for orders (in addition to WhatsApp)
- Add SMS notifications for orders
- Add notification logs/history
- Add notification templates customization
- Add multi-language support for notifications
