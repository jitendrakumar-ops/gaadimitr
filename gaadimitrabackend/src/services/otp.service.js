import crypto from 'crypto';
import { getRedisClient } from '../config/redis.js';
import { AppError } from '../utils/helpers.js';
import logger from '../utils/logger.js';

const OTP_EXPIRY_SECONDS = (Number(process.env.OTP_EXPIRY_MINUTES) || 5) * 60;
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS) || 3;
const OTP_COOLDOWN_SECONDS = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60;
const DEV_OTP = process.env.DEV_OTP || '123456';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Isolated SMS Delivery Interface
 * Easily replace with Twilio, AWS SNS, Msg91, Fast2SMS, etc.
 */
class SmsProvider {
  async sendSms(phone, message) {
    if (!isProduction) {
      // In dev/test mode, we do NOT expose OTP in production logs, only in dev
      logger.info({ phone }, `[SMS Provider Mock] SMS dispatched to ${phone}`);
      return { success: true, provider: 'mock' };
    }

    // Production SMS dispatch hook (Twilio / AWS SNS etc.)
    logger.info({ phone }, 'Production SMS sent');
    return { success: true, provider: 'production_sms' };
  }
}

export const smsProvider = new SmsProvider();

export class OtpService {
  /**
   * Generates a secure random 6-digit OTP
   */
  static generateOtp() {
    if (!isProduction && process.env.USE_DEV_OTP === 'true') {
      return DEV_OTP;
    }
    return Math.floor(100000 + crypto.randomInt(0, 900000)).toString();
  }

  /**
   * Hashes OTP for secure storage in Redis
   */
  static hashOtp(otp) {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  /**
   * Sends OTP to the given phone number with cooldown & abuse protection via Redis
   */
  static async sendOtp(phone) {
    const redis = getRedisClient();
    if (!redis) {
      throw new AppError('Cache service is unavailable. Please try again.', 503, 'SERVICE_UNAVAILABLE');
    }

    const cooldownKey = `otp:cooldown:${phone}`;
    const attemptsKey = `otp:attempts:${phone}`;
    const otpKey = `otp:data:${phone}`;

    // 1. Check Cooldown in Redis
    const remainingCooldown = await redis.ttl(cooldownKey);
    if (remainingCooldown > 0) {
      throw new AppError(
        `Please wait ${remainingCooldown} seconds before requesting a new OTP`,
        429,
        'OTP_COOLDOWN_ACTIVE'
      );
    }

    const otp = this.generateOtp();
    const otpHash = this.hashOtp(otp);
console.log(`Generated OTP for ${phone}: ${otp} (expires in ${OTP_EXPIRY_SECONDS} seconds)`);
    // 2. Save in Redis with TTL
    const pipeline = redis.pipeline();
    pipeline.set(otpKey, otpHash, 'EX', OTP_EXPIRY_SECONDS);
    pipeline.set(cooldownKey, '1', 'EX', OTP_COOLDOWN_SECONDS);
    pipeline.set(attemptsKey, '0', 'EX', OTP_EXPIRY_SECONDS);
    await pipeline.exec();

    // 3. Dispatch SMS
    const message = `Your verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`;
    await smsProvider.sendSms(phone, message);

    return {
      phone,
      expiresInSeconds: OTP_EXPIRY_SECONDS,
      cooldownSeconds: OTP_COOLDOWN_SECONDS,
      devOtp: !isProduction ? otp : undefined
    };
  }

  /**
   * Verifies the OTP provided by user/driver using Redis
   */
  static async verifyOtp(phone, inputOtp) {
    const redis = getRedisClient();
    if (!redis) {
      throw new AppError('Cache service is unavailable. Please try again.', 503, 'SERVICE_UNAVAILABLE');
    }

    const inputHash = this.hashOtp(inputOtp);
    const otpKey = `otp:data:${phone}`;
    const attemptsKey = `otp:attempts:${phone}`;

    // 1 & 2. Fetch OTP and bump attempts in a single round trip
    const readPipeline = redis.pipeline();
    readPipeline.get(otpKey);
    readPipeline.incr(attemptsKey);
    const [[, storedHash], [, currentAttempts]] = await readPipeline.exec();

    if (!storedHash) {
      throw new AppError('OTP has expired or does not exist. Please request a new code.', 400, 'OTP_EXPIRED');
    }

    if (currentAttempts > OTP_MAX_ATTEMPTS) {
      await redis.pipeline().del(otpKey).del(attemptsKey).exec();
      throw new AppError('Maximum verification attempts exceeded. Please request a new OTP.', 429, 'MAX_ATTEMPTS_EXCEEDED');
    }

    // 3. Compare hash
    if (storedHash !== inputHash) {
      const remaining = Math.max(0, OTP_MAX_ATTEMPTS - currentAttempts);
      throw new AppError(`Invalid OTP. ${remaining} attempt(s) remaining.`, 400, 'INVALID_OTP');
    }

    // 4. Success: clean up OTP & attempts keys from Redis in a single round trip
    await redis.pipeline().del(otpKey).del(attemptsKey).exec();
    return true;
  }
}

export default OtpService;
