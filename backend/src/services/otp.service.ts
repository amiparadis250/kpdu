import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import emailService from './email.service';
import { OTPResponse } from '../types';

class OTPService {
  generateOTP(length = 6): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  async sendOTP(contact: string, purpose: 'LOGIN' | 'VOTE' | 'PASSWORD_RESET'): Promise<OTPResponse> {
    try {
      // Invalidate existing OTPs
      await prisma.oTPSession.updateMany({
        where: { 
          OR: [
            { email: contact },
            { mobile: contact }
          ],
          purpose,
          isUsed: false 
        },
        data: { isUsed: true }
      });

      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRES_IN!));

      // Create OTP session
      await prisma.oTPSession.create({
        data: {
          email: contact,
          otp,
          purpose,
          expiresAt
        }
      });

      // For now, send to email (you can integrate SMS later)
      const sent = await emailService.sendOTP(contact, otp, purpose.toLowerCase());
      
      return { success: sent, message: sent ? 'OTP sent successfully' : 'Failed to send OTP' };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return { success: false, message: 'Internal server error' };
    }
  }

  async verifyOTP(contact: string, otp: string, purpose: 'LOGIN' | 'VOTE' | 'PASSWORD_RESET'): Promise<OTPResponse> {
    try {
      const session = await prisma.oTPSession.findFirst({
        where: {
          OR: [
            { email: contact },
            { mobile: contact }
          ],
          otp,
          purpose,
          isUsed: false,
          expiresAt: { gt: new Date() }
        }
      });

      if (!session) {
        // Increment attempts
        await prisma.oTPSession.updateMany({
          where: { 
            OR: [
              { email: contact },
              { mobile: contact }
            ],
            purpose,
            isUsed: false 
          },
          data: { attempts: { increment: 1 } }
        });
        return { success: false, message: 'Invalid or expired OTP' };
      }

      // Mark as used
      await prisma.oTPSession.update({
        where: { id: session.id },
        data: { isUsed: true }
      });
      
      return { success: true, message: 'OTP verified successfully' };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, message: 'Internal server error' };
    }
  }

  async cleanupExpiredOTPs(): Promise<void> {
    try {
      await prisma.oTPSession.deleteMany({
        where: {
          expiresAt: { lt: new Date() }
        }
      });
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }
}

export default new OTPService();