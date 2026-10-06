import crypto from 'crypto';

// In-memory OTP storage (prevents nodemon restart loops caused by disk writes)
const otpCache = new Map();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
const MAX_ATTEMPTS = 5;

const otpService = {
  /**
   * Generate and store a 6-digit OTP for an email
   */
  generateOtp: (email, name = '') => {
    const key = email.toLowerCase().trim();
    // Generate secure 6-digit numeric OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const now = Date.now();

    const record = {
      email: key,
      name,
      code,
      attempts: 0,
      createdAt: now,
      lastSentAt: now,
      expiresAt: now + OTP_EXPIRY_MS
    };

    otpCache.set(key, record);

    return {
      code,
      expiresInMinutes: 10,
      expiresAt: record.expiresAt
    };
  },

  /**
   * Check if a resend is allowed (rate limit cooldown)
   */
  canResend: (email) => {
    const key = email.toLowerCase().trim();
    const record = otpCache.get(key);
    if (!record) return { allowed: true };

    const elapsed = Date.now() - record.lastSentAt;
    if (elapsed < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      return { allowed: false, waitSeconds };
    }

    return { allowed: true };
  },

  /**
   * Verify an OTP for an email
   */
  verifyOtp: (email, inputCode) => {
    const key = email.toLowerCase().trim();
    const record = otpCache.get(key);

    if (!record) {
      return {
        valid: false,
        message: 'No verification code found for this email. Please request a new code.'
      };
    }

    if (Date.now() > record.expiresAt) {
      otpCache.delete(key);
      return {
        valid: false,
        message: 'Verification code has expired (valid for 10 minutes). Please request a new code.'
      };
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      otpCache.delete(key);
      return {
        valid: false,
        message: 'Too many incorrect attempts. Please request a new verification code.'
      };
    }

    const cleanInput = String(inputCode || '').trim();
    if (record.code !== cleanInput) {
      record.attempts += 1;
      const remaining = MAX_ATTEMPTS - record.attempts;
      return {
        valid: false,
        message: `Invalid verification code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Please request a new code.'}`
      };
    }

    // Success - consume and remove the OTP
    otpCache.delete(key);
    return { valid: true };
  },

  /**
   * Validate OTP code specifically for password reset without immediately deleting it.
   * Generates a temporary resetToken valid for completing the password change.
   */
  validateResetOtp: (email, inputCode) => {
    const key = email.toLowerCase().trim();
    const record = otpCache.get(key);

    if (!record) {
      return {
        valid: false,
        message: 'No verification code found for this email. Please request a new code.'
      };
    }

    if (Date.now() > record.expiresAt) {
      otpCache.delete(key);
      return {
        valid: false,
        message: 'Verification code has expired. Please request a new code.'
      };
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      otpCache.delete(key);
      return {
        valid: false,
        message: 'Too many incorrect attempts. Please request a new verification code.'
      };
    }

    const cleanInput = String(inputCode || '').trim();
    if (record.code !== cleanInput) {
      record.attempts += 1;
      const remaining = MAX_ATTEMPTS - record.attempts;
      return {
        valid: false,
        message: `Invalid verification code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Please request a new code.'}`
      };
    }

    // Mark as verified & issue secure resetToken
    const resetToken = crypto.randomBytes(24).toString('hex');
    record.verified = true;
    record.resetToken = resetToken;
    record.resetTokenExpiresAt = Date.now() + 15 * 60 * 1000; // 15 mins validity for setting password

    return {
      valid: true,
      resetToken
    };
  },

  /**
   * Verify reset authorization (by resetToken or OTP) and consume it upon password change
   */
  verifyAndConsumeResetAuth: (email, { resetToken, otp }) => {
    const key = email.toLowerCase().trim();
    const record = otpCache.get(key);

    if (!record) {
      return {
        valid: false,
        message: 'Reset authorization not found or has expired. Please restart password reset.'
      };
    }

    // If resetToken provided
    if (resetToken) {
      if (record.verified && record.resetToken === resetToken && Date.now() <= record.resetTokenExpiresAt) {
        otpCache.delete(key);
        return { valid: true };
      }
      return {
        valid: false,
        message: 'Invalid or expired password reset session. Please verify your OTP again.'
      };
    }

    // Fallback: If only otp provided directly
    if (otp) {
      const cleanInput = String(otp).trim();
      if (record.code === cleanInput && Date.now() <= record.expiresAt) {
        otpCache.delete(key);
        return { valid: true };
      }
      return {
        valid: false,
        message: 'Invalid or expired verification code.'
      };
    }

    return {
      valid: false,
      message: 'Verification code or reset token is required.'
    };
  },

  /**
   * Get active OTP record without consuming (for dev/debugging)
   */
  getRecord: (email) => {
    const key = email.toLowerCase().trim();
    return otpCache.get(key);
  },

  /**
   * Manually remove an OTP
   */
  clearOtp: (email) => {
    const key = email.toLowerCase().trim();
    otpCache.delete(key);
  }
};

export default otpService;
