import { Request, Response } from 'express';
import { Payment } from '../models/payment'; // Adjust import path based on your model
import User from '../models/users'; // Adjust import path based on your model
import crypto from 'crypto';
import axios from 'axios';

// Paystack API keys (use environment variables for security)
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Create Payment
export const createPayment = async (req: Request, res: Response) => {
  const { userId, amount, email } = req.body;

  try {
    // Validate input
    if (!userId || !amount || !email) {
      res.status(400).json({ message: 'Missing required fields' })
      return;
    }

    // Find user in the database
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return;
    }

    // Initialize payment with Paystack
    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, // Convert amount to kobo
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (paystackResponse.data.status) {
      // Save the payment record to the database
      const payment = new Payment({
        userId: user._id,
        amount,
        paymentMethod: 'Paystack',
        paymentStatus: 'Pending',
        transactionId: paystackResponse.data.data.reference,
        paymentDate: new Date(),
      });
      await payment.save();

      res.status(201).json({
        message: 'Payment initialized successfully',
        payment,
        authorizationUrl: paystackResponse.data.data.authorization_url, // Provide URL for frontend redirection
      })
      return;
    } else {
      res.status(400).json({ message: 'Payment initialization failed' })
      return;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (axios.isAxiosError(error)) {
        if (axios.isAxiosError(error)) {
          if (axios.isAxiosError(error)) {
            if (axios.isAxiosError(error)) {
              console.error(error.response?.data || error.message);
            } else {
              console.error(error);
            }
          } else {
            console.error(error);
          }
        } else {
          console.error(error);
        }
      } else {
        console.error(error);
      }
    } else {
      console.error(error);
    }
    res.status(500).json({ message: 'Internal server error' })
    return;
  }
};

// Webhook to confirm payment
// export const paymentWebhook = async (req: Request, res: Response) => {
//   const secret = process.env.PAYSTACK_SECRET_KEY; // Your Paystack secret key
//   if (!secret) {
//    res.status(500).json({ message: 'Paystack secret key is not defined' })
//    return;
//   }
//   const signature = req.headers['x-paystack-signature'] as string; // Paystack signature header

//   // Validate signature
//   const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
//   if (hash !== signature) {
//  res.status(401).json({ message: 'Invalid signature' })
//  return;
//   }

//   try {
//     const event = req.body;

//     // Handle payment event
//     if (event.event === 'charge.success') {
//       const { reference, amount } = event.data;

//       // Find the payment in the database by reference
//       const payment = await Payment.findOne({ transactionId: reference });
//       if (!payment) {
//        res.status(404).json({ message: 'Payment not found' })
//        return;
//       }

//       // Update payment status
//       payment.paymentStatus = 'Success';
//       payment.amount = amount / 100; // Convert amount to match your system's format
//       await payment.save();

//       console.log('Payment status updated successfully:', payment);
//     }

//     res.status(200).json({ message: 'Webhook processed successfully' })
//     return;
//   } catch (error) {
//     console.error('Error processing webhook:', error);
//      res.status(500).json({ message: 'Internal server error' })
//      return;
//   }
// };


// Mark Payment as Success
export const markPaymentAsSuccess = async (req: Request, res: Response) => {
  const { paymentId } = req.params; // Or req.body, depending on your API design

  try {
    // Find the payment in the database
    const payment = await Payment.findById(paymentId);
    if (!payment) {
       res.status(404).json({ message: 'Payment not found' })
       return;
    }

    // Check if the payment is already marked as success
    if (payment.paymentStatus === 'Completed') {
      res.status(400).json({ message: 'Payment is already marked as completed' })
      return;
    }

    // Update payment status to "Success"
    payment.paymentStatus = 'Success';
    await payment.save();

     res.status(200).json({
      message: 'Payment status updated to success',
      payment,
    })
    return;
  } catch (error) {
    console.error('Error marking payment as success:', error);
    res.status(500).json({ message: 'Internal server error' })
    return;
  }
};

// Verify Payment
export const verifyPayment = async (req: Request, res: Response) => {
  const { reference } = req.query;

  try {
    if (!reference) {
      res.status(400).json({ message: 'Missing payment reference' })
      return;
    }

    // Verify payment with Paystack
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    // const paymentData = paystackResponse.data.data;
    // Find the payment record in the database
    const payment = await Payment.findOne({ transactionId: reference });
    if (!payment) {
      res.status(404).json({ message: 'Payment not found' })
      return;
    }

    if (payment.paymentStatus === 'Success') {
      // Update the payment record in the database
      const payment = await Payment.findOneAndUpdate(
        { transactionId: reference },
        { paymentStatus: 'Completed' },
        { new: true }
      );

      res.status(200).json({
        message: 'Payment verified successfully',
        payment,
      })
      return;
    } else {
      res.status(400).json({ message: 'Payment verification failed' })
      return;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (axios.isAxiosError(error)) {
        if (axios.isAxiosError(error)) {
          if (axios.isAxiosError(error)) {
            if (axios.isAxiosError(error)) {
              console.error(error.response?.data || error.message);
            } else {
              console.error(error);
            }
          } else {
            console.error(error);
          }
        } else {
          console.error(error);
        }
      } else {
        console.error(error);
      }
    } else {
      console.error(error);
    }
    res.status(500).json({ message: 'Internal server error' })
    return;
  }
};

// Refund Payment
export const refundPaymentController = async (req: Request, res: Response) => {
  const { paymentId } = req.params;

  try {
    // Find payment record in the database
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      res.status(404).json({ message: 'Payment not found' })
      return;
    }

    // Check if the payment is refundable
    if (payment.paymentStatus !== 'Completed') {
      res.status(400).json({ message: 'Payment is not eligible for refund' })
      return;
    }

    // Refund payment via Paystack
    const refundResponse = await axios.post(
      'https://api.paystack.co/refund',
      {
        transaction: payment.transactionId,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (refundResponse.data.status) {
      // Update payment status to refunded
      payment.paymentStatus = 'Refunded';
      await payment.save();

      res.status(200).json({
        message: 'Payment refunded successfully',
        payment,
      })
      return;
    } else {
      res.status(400).json({ message: 'Refund failed', error: refundResponse.data.message })
      return;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (axios.isAxiosError(error)) {
        if (axios.isAxiosError(error)) {
          if (axios.isAxiosError(error)) {
            if (axios.isAxiosError(error)) {
              console.error(error.response?.data || error.message);
            } else {
              console.error(error);
            }
          } else {
            console.error(error);
          }
        } else {
          console.error(error);
        }
      } else {
        console.error(error);
      }
    } else {
      console.error(error);
    }
    res.status(500).json({ message: 'Internal server error' })
    return;
  }
};

// Get Payment Details
export const getPaymentDetails = async (req: Request, res: Response) => {
  const { paymentId } = req.params;

  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      res.status(404).json({ message: 'Payment not found' })
      return;
    }

    res.status(200).json({ payment })
    return;
  } catch (error) {
    console.error(error);
     res.status(500).json({ message: 'Internal server error' })
     return;
  }
};

export default {
  createPayment,
  // paymentWebhook,
  markPaymentAsSuccess,
  verifyPayment,
  refundPaymentController,
  getPaymentDetails,
};


