import { Router } from 'express';
import { body } from 'express-validator';
import authController from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

// Login (No Auth)
router.post('/login', [
  body('memberId').notEmpty().withMessage('Member ID is required'),
  body('nationalId').notEmpty().withMessage('National ID is required')
], validateRequest, authController.login);

// Verify OTP (No Auth)
router.post('/verify-otp', [
  body('memberId').notEmpty().withMessage('Member ID is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], validateRequest, authController.verifyLoginOTP);

// Get profile (No Auth for testing)
router.get('/profile', authController.getProfile);

export default router;