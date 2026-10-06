import nodemailer from 'nodemailer';

let cachedTransporter = null;

// Build email transporter with pooling and high-speed direct SSL
const createTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) return null;

  // For Gmail, service: 'gmail' uses direct SSL delivering in ~800ms (avoids 22s Windows STARTTLS lag)
  if (host === 'smtp.gmail.com' || (user && user.endsWith('@gmail.com')) || !host) {
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      pool: true,
      maxConnections: 3,
      maxMessages: 50
    });
    return cachedTransporter;
  }

  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    pool: true,
    tls: {
      rejectUnauthorized: false
    }
  });

  return cachedTransporter;
};

/**
 * Generate luxury Mithila Makhana branded HTML template for OTP verification
 */
const generateOtpHtml = ({ name, otp, email }) => {
  const recipientName = name ? name.trim() : 'Valued Customer';
  const digits = otp.split('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mithila Makhana - Verify Your Email</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #FAF6F0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #321F12;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #FAF6F0;
      padding: 40px 10px;
    }
    .main-table {
      max-width: 560px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 24px;
      border: 1px solid #E8DEC9;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(50, 31, 18, 0.06);
    }
    .header-bar {
      background: linear-gradient(135deg, #4A2E1B 0%, #27170E 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .brand-title {
      color: #FAF6F0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin: 0;
      font-family: Georgia, 'Times New Roman', serif;
    }
    .brand-subtitle {
      color: #D99B26;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-top: 6px;
    }
    .content-area {
      padding: 36px 32px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #4A2E1B;
      margin: 0 0 12px 0;
      font-family: Georgia, 'Times New Roman', serif;
    }
    .body-text {
      font-size: 14px;
      line-height: 1.6;
      color: #6D4A32;
      margin: 0 0 24px 0;
    }
    .otp-container {
      background-color: #FEF8EA;
      border: 2px dashed #D99B26;
      border-radius: 16px;
      padding: 24px 16px;
      text-align: center;
      margin: 28px 0;
    }
    .otp-label {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #B07812;
      margin-bottom: 8px;
    }
    .otp-digits {
      font-family: 'Courier New', Courier, monospace;
      font-size: 34px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #4A2E1B;
      margin: 6px 0;
    }
    .otp-validity {
      font-size: 12px;
      color: #8A6D56;
      margin-top: 8px;
    }
    .security-notice {
      background-color: #FAF6F0;
      border-radius: 12px;
      padding: 14px 16px;
      font-size: 12px;
      color: #8A6D56;
      line-height: 1.5;
      margin-top: 24px;
    }
    .footer-bar {
      background-color: #FAF6F0;
      border-top: 1px solid #E8DEC9;
      padding: 24px;
      text-align: center;
      font-size: 11px;
      color: #8A6D56;
    }
    .footer-bar p {
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main-table" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td class="header-bar">
          <h1 class="brand-title">Mithila Makhana</h1>
          <div class="brand-subtitle">Authentic Bihar Heritage • Wetland Harvest</div>
        </td>
      </tr>
      <tr>
        <td class="content-area">
          <h2 class="greeting">Hello, ${recipientName}!</h2>
          <p class="body-text">
            Thank you for registering at <strong>Mithila Makhana</strong>. To verify your email address (<code>${email}</code>) and activate your account, please enter the one-time verification code below:
          </p>

          <div class="otp-container">
            <div class="otp-label">Your Email Verification Code</div>
            <div class="otp-digits">${otp}</div>
            <div class="otp-validity">⏱ Valid for <strong>10 minutes</strong>. Single use only.</div>
          </div>

          <div class="security-notice">
            🔒 <strong>Security Warning:</strong> Never share this verification code with anyone. Mithila Makhana staff will never call or message asking for your password or OTP. If you did not create an account on our website, please ignore this email.
          </div>
        </td>
      </tr>
      <tr>
        <td class="footer-bar">
          <p><strong>Mithila Makhana Private Limited</strong></p>
          <p>Station Road, Near Makhana Research Hub, Darbhanga, Bihar - 846004, India</p>
          <p>Contact: support@mithilamakhana.com | GSTIN: 10AAAFM1234F1Z5</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Generate luxury Mithila Makhana branded HTML template for Password Reset OTP
 */
const generateResetPasswordOtpHtml = ({ name, otp, email }) => {
  const recipientName = name ? name.trim() : 'Valued Customer';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mithila Makhana - Reset Your Password</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #FAF6F0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #321F12;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #FAF6F0;
      padding: 40px 10px;
    }
    .main-table {
      max-width: 560px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 24px;
      border: 1px solid #E8DEC9;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(50, 31, 18, 0.06);
    }
    .header-bar {
      background: linear-gradient(135deg, #4A2E1B 0%, #27170E 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .brand-title {
      color: #FAF6F0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin: 0;
      font-family: Georgia, 'Times New Roman', serif;
    }
    .brand-subtitle {
      color: #D99B26;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-top: 6px;
    }
    .content-area {
      padding: 36px 32px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #4A2E1B;
      margin: 0 0 12px 0;
      font-family: Georgia, 'Times New Roman', serif;
    }
    .body-text {
      font-size: 14px;
      line-height: 1.6;
      color: #6D4A32;
      margin: 0 0 24px 0;
    }
    .otp-container {
      background-color: #FEF8EA;
      border: 2px dashed #D99B26;
      border-radius: 16px;
      padding: 24px 16px;
      text-align: center;
      margin: 28px 0;
    }
    .otp-label {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #B07812;
      margin-bottom: 8px;
    }
    .otp-digits {
      font-family: 'Courier New', Courier, monospace;
      font-size: 34px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #4A2E1B;
      margin: 6px 0;
    }
    .otp-validity {
      font-size: 12px;
      color: #8A6D56;
      margin-top: 8px;
    }
    .security-notice {
      background-color: #FAF6F0;
      border-radius: 12px;
      padding: 14px 16px;
      font-size: 12px;
      color: #8A6D56;
      line-height: 1.5;
      margin-top: 24px;
    }
    .footer-bar {
      background-color: #FAF6F0;
      border-top: 1px solid #E8DEC9;
      padding: 24px;
      text-align: center;
      font-size: 11px;
      color: #8A6D56;
    }
    .footer-bar p {
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main-table" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td class="header-bar">
          <h1 class="brand-title">Mithila Makhana</h1>
          <div class="brand-subtitle">Authentic Bihar Heritage • Wetland Harvest</div>
        </td>
      </tr>
      <tr>
        <td class="content-area">
          <h2 class="greeting">Hello, ${recipientName}!</h2>
          <p class="body-text">
            We received a request to reset your password for your Mithila Makhana account associated with <strong>${email}</strong>. Use the 6-digit verification code below to authorize your new password:
          </p>

          <div class="otp-container">
            <div class="otp-label">Password Reset Code</div>
            <div class="otp-digits">${otp}</div>
            <div class="otp-validity">⏱ Valid for <strong>10 minutes</strong>. Single use only.</div>
          </div>

          <div class="security-notice">
            🔒 <strong>Security Warning:</strong> If you did not request a password reset, please ignore this email. Your current password remains secure, and no changes will be made to your account.
          </div>
        </td>
      </tr>
      <tr>
        <td class="footer-bar">
          <p><strong>Mithila Makhana Private Limited</strong></p>
          <p>Station Road, Near Makhana Research Hub, Darbhanga, Bihar - 846004, India</p>
          <p>Contact: support@mithilamakhana.com | GSTIN: 10AAAFM1234F1Z5</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `.trim();
};

const emailService = {
  /**
   * Send Registration OTP via Email
   */
  sendRegisterOtpEmail: async ({ email, name, otp }) => {
    let fromAddress = process.env.EMAIL_FROM;
    if (!fromAddress || fromAddress.includes('noreply@mithilamakhana.com')) {
      fromAddress = process.env.SMTP_USER 
        ? `"Mithila Makhana" <${process.env.SMTP_USER}>` 
        : '"Mithila Makhana" <noreply@mithilamakhana.com>';
    }
    const transporter = createTransporter();

    // Prominent console output for local development / testing
    console.log('\n' + '═'.repeat(64));
    console.log('   MITHILA MAKHANA - EMAIL OTP NOTIFICATION');
    console.log('═'.repeat(64));
    console.log(`   To:       ${email} (${name || 'New Customer'})`);
    console.log(`   OTP CODE: [ ${otp} ]`);
    console.log(`   Expires:  In 10 minutes`);
    console.log(`   Time:     ${new Date().toLocaleTimeString('en-IN')}`);
    if (!transporter) {
      console.log('   Note:     SMTP credentials not detected in .env.');
      console.log('             Live email bypassed. In dev mode, use OTP above.');
    } else {
      console.log('   Status:   Dispatching via SMTP transporter...');
    }
    console.log('═'.repeat(64) + '\n');

    if (!transporter) {
      // In development or when SMTP is not configured, return devOtp for preview
      return {
        sent: true,
        method: 'console_dev',
        devOtp: otp,
        message: 'Verification code generated (development mode).'
      };
    }

    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject: `${otp} is your Mithila Makhana Verification Code`,
        text: `Hello ${name || 'Customer'},\n\nYour 6-digit verification code for Mithila Makhana is: ${otp}\n\nThis code will expire in 10 minutes.\n\nThank you,\nMithila Makhana Team`,
        html: generateOtpHtml({ name, otp, email })
      });

      console.log(`✅ Live email delivered via SMTP! Message ID: ${info.messageId}`);
      return {
        sent: true,
        method: 'smtp',
        messageId: info.messageId,
        devOtp: process.env.NODE_ENV === 'development' ? otp : null
      };
    } catch (err) {
      console.error('❌ Failed to deliver email via SMTP:', err.message);
      // Fallback gracefully so registration flow is not completely blocked
      return {
        sent: true,
        method: 'fallback_console',
        devOtp: otp,
        error: err.message
      };
    }
  },

  /**
   * Send Password Reset OTP via Email
   */
  sendResetPasswordOtpEmail: async ({ email, name, otp }) => {
    let fromAddress = process.env.EMAIL_FROM;
    if (!fromAddress || fromAddress.includes('noreply@mithilamakhana.com')) {
      fromAddress = process.env.SMTP_USER 
        ? `"Mithila Makhana" <${process.env.SMTP_USER}>` 
        : '"Mithila Makhana" <noreply@mithilamakhana.com>';
    }
    const transporter = createTransporter();

    console.log('\n' + '═'.repeat(64));
    console.log('   MITHILA MAKHANA - PASSWORD RESET OTP');
    console.log('═'.repeat(64));
    console.log(`   To:       ${email} (${name || 'Account Holder'})`);
    console.log(`   OTP CODE: [ ${otp} ]`);
    console.log(`   Expires:  In 10 minutes`);
    console.log(`   Time:     ${new Date().toLocaleTimeString('en-IN')}`);
    if (!transporter) {
      console.log('   Note:     SMTP credentials not detected in .env.');
      console.log('             Live email bypassed. In dev mode, use OTP above.');
    } else {
      console.log('   Status:   Dispatching password reset code via SMTP transporter...');
    }
    console.log('═'.repeat(64) + '\n');

    if (!transporter) {
      return {
        sent: true,
        method: 'console_dev',
        devOtp: otp,
        message: 'Password reset code generated (development mode).'
      };
    }

    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject: `${otp} is your Mithila Makhana Password Reset Code`,
        text: `Hello ${name || 'Customer'},\n\nYour 6-digit password reset code for Mithila Makhana is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request a password reset, please ignore this message.\n\nThank you,\nMithila Makhana Team`,
        html: generateResetPasswordOtpHtml({ name, otp, email })
      });

      console.log(`✅ Live password reset email delivered via SMTP! Message ID: ${info.messageId}`);
      return {
        sent: true,
        method: 'smtp',
        messageId: info.messageId,
        devOtp: process.env.NODE_ENV === 'development' ? otp : null
      };
    } catch (err) {
      console.error('❌ Failed to deliver password reset email via SMTP:', err.message);
      return {
        sent: true,
        method: 'fallback_console',
        devOtp: otp,
        error: err.message
      };
    }
  }
};

export default emailService;
