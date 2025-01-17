import express from 'express';
import { 
  createPayment,
  completePaymentController, // Renamed for consistency
  refundPaymentController, 
  getPaymentDetailsController,
  verifyPaymentController,
  markPaymentSuccessController,
  receivedWebHook
} from '../controllers/paymentControl'; 
import authMiddleware from '../middlewares/authMiddlewares';

const router = express.Router();

// Route for creating a payment
router.post('/payments', authMiddleware, createPayment);

// Route for handling Paystack webhook events
router.post('/payments/webhook', receivedWebHook);

// Route for verifying a payment
router.get('/payments/:paymentId/verify', authMiddleware, verifyPaymentController);

// Route for marking a payment as success
router.put('/payments/:paymentId/success', authMiddleware, markPaymentSuccessController);

// Route for completing a payment (used for manual completion or webhook-based processing)
router.put('/payments/:paymentId/complete', authMiddleware, completePaymentController);

// Route for refunding a payment
router.post('/payments/:paymentId/refund', authMiddleware, refundPaymentController);

// Route for retrieving payment details
router.get('/payments/:paymentId', authMiddleware, getPaymentDetailsController);

export default router;

