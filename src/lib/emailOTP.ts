import nodemailer from "nodemailer";

interface EmailOTPOptions {
  to: string;
  otp: string;
  customerName: string;
}

/**
 * Send OTP via email (FREE - uses Gmail SMTP)
 * Setup: Add to .env file:
 * EMAIL_USER=your-email@gmail.com
 * EMAIL_PASS=your-app-password (generate from Google Account settings)
 */
export async function sendEmailOTP({ to, otp, customerName }: EmailOTPOptions): Promise<{ success: boolean; message: string }> {
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.log("📧 [Email OTP] Not configured. OTP:", otp);
      return { 
        success: false, 
        message: "Email not configured. Check console for OTP." 
      };
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Email HTML template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 15px 0; font-size: 14px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Customer Portal Login</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${customerName}</strong>,</p>
            <p>Your One-Time Password (OTP) for logging into the customer portal is:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
              <p style="margin-top: 10px; color: #666;">Valid for 10 minutes</p>
            </div>
            
            <div class="warning">
              ⚠️ <strong>Security Notice:</strong> Never share this OTP with anyone. Our staff will never ask for this code.
            </div>
            
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} OptixShop - Optical Store Management</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: `"OptixShop Customer Portal" <${emailUser}>`,
      to: to,
      subject: `Your OTP Code: ${otp}`,
      html: htmlContent,
      text: `Hello ${customerName},\n\nYour OTP for customer portal login is: ${otp}\n\nValid for 10 minutes.\n\nDo not share this code with anyone.`,
    });

    console.log("✅ [Email OTP] Sent successfully to:", to);
    return { success: true, message: "OTP sent to your email" };
  } catch (error) {
    console.error("❌ [Email OTP] Error:", error);
    return { success: false, message: "Failed to send OTP email" };
  }
}
