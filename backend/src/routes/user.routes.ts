import { Router } from 'express';
import userController, { upload } from '../controllers/user.controller';

const router = Router();

// Import users from Excel (No Auth)
router.post('/import', 
  upload.single('file'), 
  userController.importVoters
);

// Get users with pagination and filtering (No Auth)
router.get('/', 
  userController.getUsers
);

// Get users grouped by branch (No Auth)
router.get('/branch-stats', 
  userController.getUsersByBranch
);

export default router;