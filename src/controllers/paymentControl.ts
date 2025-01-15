import { Request, Response } from 'express';
import { Payment } from '../models/payment'; // Adjust import path based on your model
import  User  from '../models/users'; // Adjust import path based on your model
import { processPayment, refundPayment } from '../services/paymentServices'; // Custom payment processing service

// Create Payment
export const createPayment = async (req: Request, res: Response) => {
  const { userId, amount, paymentMethod } = req.body;

  try {
    // Find user in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Process the payment using a payment gateway (Stripe/PayPal/etc.)
    const paymentResult = await processPayment(amount, paymentMethod);

    if (paymentResult.success) {
      // Save payment record to the database
      const payment = new Payment({
        userId: user._id,
        amount,
        paymentMethod,
        paymentStatus: 'Completed',
        transactionId: paymentResult.transactionId,
        paymentDate: new Date(),
      });
      await payment.save();

      return res.status(201).json({
        message: 'Payment successful',
        payment,
      });
    } else {
      return res.status(400).json({ message: 'Payment failed', error: paymentResult.error });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Refund Payment
export const refundPaymentController = async (req: Request, res: Response) => {
  const { paymentId } = req.params;

  try {
    // Find payment record in the database
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if the payment is refundable (you can add additional checks here)
    if (payment.paymentStatus !== 'Completed') {
      return res.status(400).json({ message: 'Payment is not eligible for refund' });
    }

    // Refund the payment via payment gateway
    const refundResult = await refundPayment(payment.transactionId);

    if (refundResult.success) {
      // Update payment status to refunded
      payment.paymentStatus = 'Refunded';
      await payment.save();

      return res.status(200).json({
        message: 'Payment refunded successfully',
        payment,
      });
    } else {
      return res.status(400).json({ message: 'Refund failed', error: refundResult.error });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Payment Details
export const getPaymentDetails = async (req: Request, res: Response) => {
  const { paymentId } = req.params;

  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    return res.status(200).json({ payment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
