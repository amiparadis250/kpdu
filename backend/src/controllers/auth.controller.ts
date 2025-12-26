import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../lib/prisma';
import otpService from '../services/otp.service';

class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { memberId, nationalId } = req.body;

      const user = await prisma.user.findUnique({
        where: { memberId },
        include: { branchRef: true }
      });

      if (!user || user.nationalId !== nationalId) {
        res.status(401).json({ message: 'Invalid Member ID or National ID' });
        return;
      }

      if (!user.isActive) {
        res.status(401).json({ message: 'Account is deactivated' });
        return;
      }

      const otpResult = await otpService.sendOTP(user.mobileNumber, 'LOGIN');
      
      if (!otpResult.success) {
        res.status(500).json({ message: 'Failed to send OTP' });
        return;
      }

      res.json({ 
        message: 'OTP sent to your mobile number',
        requiresOTP: true,
        mobileNumber: user.mobileNumber,
        memberId: memberId
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async verifyLoginOTP(req: Request, res: Response): Promise<void> {
    try {
      const { memberId, otp } = req.body;

      const user = await prisma.user.findUnique({
        where: { memberId },
        include: { branchRef: true }
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const otpResult = await otpService.verifyOTP(user.mobileNumber, otp, 'LOGIN');
      
      if (!otpResult.success) {
        res.status(401).json({ message: otpResult.message });
        return;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      const token = jwt.sign(
        { 
          userId: user.id,
          memberId: user.memberId,
          role: user.role,
          branch: user.branch
        },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN ? parseInt(process.env.JWT_EXPIRES_IN, 10) : undefined }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          memberId: user.memberId,
          memberName: user.memberName,
          nationalId: user.nationalId,
          mobileNumber: user.mobileNumber,
          branch: user.branch,
          role: user.role,
          hasVoted: user.hasVoted
        }
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // For testing without auth - return sample user
      const sampleUser = {
        id: 'sample-id',
        memberId: '12345',
        memberName: 'Test User',
        nationalId: '987654321',
        mobileNumber: '0712345678',
        branch: 'WESTERN_MEMBER',
        role: 'MEMBER',
        hasVoted: false
      };

      res.json({ user: sampleUser });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default new AuthController();