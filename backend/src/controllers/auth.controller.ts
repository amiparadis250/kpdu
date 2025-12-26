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

      if (!user.email) {
        res.status(400).json({ message: 'No email address found for this user. Please contact admin.' });
        return;
      }
      console.log('Sending OTP to email:', user.email);
      const otpResult = await otpService.sendOTP(user.email, 'LOGIN');
      
      if (!otpResult.success) {
        res.status(500).json({ message: 'Failed to send OTP' });
        return;
      }

      res.json({ 
        message: 'OTP sent to your email',
        requiresOTP: true,
        email: user.email,
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

      if (!user.email) {
        res.status(400).json({ message: 'No email address found for this user. Please contact admin.' });
        return;
      }
      
      const otpResult = await otpService.verifyOTP(user.email, otp, 'LOGIN');
      
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
        { expiresIn: parseInt(process.env.JWT_EXPIRES_IN!) || 86400 }
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

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        include: { branchRef: true }
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default new AuthController();