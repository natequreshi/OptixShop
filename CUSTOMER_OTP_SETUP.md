# Customer Portal OTP Setup Guide

## 🆓 FREE Email OTP (Recommended for Now)

### Setup Steps:

1. **Enable Gmail App Password** (5 minutes)
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification (if not already enabled)
   - Search for "App passwords"
   - Generate new app password for "Mail"
   - Copy the 16-character password

2. **Add to your `.env` file**:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-char-app-password
   ```

3. **That's it!** 🎉
   - OTP will be sent via email
   - No cost, unlimited emails
   - Beautiful HTML email template included

---

## 📱 Current Behavior (Without Setup)

**If Email OTP not configured:**
- OTP shown in console/terminal
- Also returned in API response (debug mode)
- Customer can see OTP in browser console

**Login Flow:**
1. Customer enters email/phone → OTP sent to email (if configured)
2. Customer enters phone → WhatsApp attempted, then email fallback
3. If nothing configured → OTP shown in console for testing

---

## 🔧 Optional: WhatsApp Setup (Paid)

For WhatsApp OTP, you need WhatsApp Business API:

### Option 1: Twilio WhatsApp (Has free trial)
```env
WHATSAPP_API_URL=https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json
WHATSAPP_API_TOKEN=your-twilio-auth-token
```

### Option 2: Meta WhatsApp Business API (Requires approval)
```env
WHATSAPP_API_URL=https://graph.facebook.com/v17.0/{phone-number-id}/messages
WHATSAPP_API_TOKEN=your-meta-access-token
```

Add these to settings via `/settings` page.

---

## 🧪 Testing Without Setup

**Current Demo Mode:**
```javascript
// OTP appears in terminal:
📧 [Email OTP] Not configured. OTP: 123456

// Also in API response:
{
  "success": true,
  "debug": {
    "otp": "123456",
    "method": "console"
  }
}
```

Customer can copy OTP from browser console (F12 → Console tab).

---

## 📊 Priority Order

1. **Email entered** → Email OTP (FREE)
2. **Phone entered** → WhatsApp OTP (if configured) → Email fallback (if email exists)
3. **Nothing configured** → Console/Debug mode

---

## 🚀 Production Recommendations

1. Use **Email OTP** for free, reliable delivery
2. Add **WhatsApp** only if customers prefer it
3. Remove `debug` object from API response in production
4. Keep both options available (customer choice)

---

## ✅ Current Status

- ✅ Email OTP system ready (needs Gmail setup)
- ✅ WhatsApp OTP ready (needs API setup)
- ✅ Phone normalization (all formats work)
- ✅ Auto-fill OTP from SMS
- ✅ Fallback to email if WhatsApp fails
- ✅ Debug mode for testing
