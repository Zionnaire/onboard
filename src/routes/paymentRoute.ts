import express from 'express';
import { 
  createPayment,
  // paymentWebhook, 
  refundPaymentController, 
  getPaymentDetails,
  verifyPayment,
  markPaymentAsSuccess,
 
} from '../controllers/paymentControl'; // Adjust the path to your controller file
import authMiddleware from '../middlewares/authMiddlewares'; // Adjust the path to your middleware file

const router = express.Router();

// Create a payment
router.post('/payments', authMiddleware, createPayment);

// Refund a payment
router.post('/payments/:paymentId/refund', authMiddleware, refundPaymentController);
router.post('/payments/:paymentId/verifyPayment', authMiddleware, verifyPayment);
router.put('/payments/:paymentId/paymentSuccess', authMiddleware, markPaymentAsSuccess);

// router.put('/payments/:paymentId/paymentSuccess', authMiddleware, paymentWebhook);

// Get payment details
router.get('/payments/:paymentId', authMiddleware, getPaymentDetails);

export default router;
