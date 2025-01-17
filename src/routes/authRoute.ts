import { Router } from 'express';
import { register, login, forgetPassword, recoverPassword, resendAuthCode } from '../controllers/authController';
import authMiddleware from '../middlewares/authMiddlewares';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/recover-password', authMiddleware, recoverPassword);
router.post('/forget-password', authMiddleware, forgetPassword);
router.post('/resendAuthCode', authMiddleware, resendAuthCode);

export default router;
