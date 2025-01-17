import express from 'express';
import axios from 'axios';
import { Payment } from '../models/payment';	
import crypto from 'crypto';
import User from '../models/users';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

export const initializePayment = async (userId: string, amount: number, currency: string, email: string, paymentMethod: string) => {
  if (!userId || !amount || !email || !currency) {
    throw new Error('Missing required fields');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const paystackResponse = await axios.post(
    'https://api.paystack.co/transaction/initialize',
    { email, amount, currency, paymentMethod },
    { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
  );

  const { reference, authorization_url } = paystackResponse.data.data;

  const payment = new Payment({
    userId,
    amount,
    currency,
    paymentMethod,
    paymentStatus: 'Pending',
    transactionId: reference,
    paymentDate: new Date(),
  });

  await payment.save();

  return { payment, authorizationUrl: authorization_url };
};

export const verifyWebhook = async (req: any) => {
  const secret = PAYSTACK_SECRET_KEY;
  const signature = req.headers['x-paystack-signature'];

  if (!secret) {
    throw new Error('PAYSTACK_SECRET_KEY is not defined');
  }
  const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
  if (hash !== signature) {
    throw new Error('Invalid signature');
  }

  const event = req.body;
  await completePayment(event);
};

// Function to verify payment
export const verifyPayment = async (transactionId: string) => {
  const response = await axios.get(
    `https://api.paystack.co/transaction/verify/${transactionId}`,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  if (!response.data.status) {
    throw new Error(response.data.message);
  }

  const payment = await Payment.findOne({ transactionId });
  if (!payment) {
    throw new Error('Payment not found');
  }

  if (response.data.data.status === 'success') {
    payment.paymentStatus = 'Completed';
  } else {
    payment.paymentStatus = 'Failed';
  }

  await payment.save();

  return { message: 'Payment verified successfully', payment };

}

// Function to complete payment

export const completePayment = async (event: any) => {
  const { reference } = event.data;

  const payment = await Payment.findOne({ transactionId: reference });
  if (!payment) {
    throw new Error('Payment not found');
  }

  if (event.event === 'charge.success') {
    payment.paymentStatus = 'Completed';
  } else {
    payment.paymentStatus = 'Failed';
  }

  await payment.save();
};


export const markPaymentAsSuccess = async (paymentId: string) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new Error('Payment not found');
  }

  if (payment.paymentStatus === 'Success') {
    throw new Error('Payment is already marked as successful');
  }

  payment.paymentStatus = 'Success';
  await payment.save();

  return { message: 'Payment marked as success', payment };
};

export const refundPayment = async (paymentId: string) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new Error('Payment not found');
  }

  if (payment.paymentStatus !== 'Completed') {
    throw new Error('Payment is not eligible for refund');
  }

  const refundResponse = await axios.post(
    'https://api.paystack.co/refund',
    { transaction: payment.transactionId },
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  if (!refundResponse.data.status) {
    throw new Error(`Refund failed: ${refundResponse.data.message}`);
  }

  payment.paymentStatus = 'Refunded';
  await payment.save();

  return { message: 'Payment refunded successfully', payment };
};

export const getPaymentDetails = async (paymentId: string) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new Error('Payment not found');
  }

  return { message: 'Payment details retrieved successfully', payment };
};



export default { initializePayment, verifyWebhook, completePayment, refundPayment, markPaymentAsSuccess, getPaymentDetails, verifyPayment };



















// // Function to process payment
// export const processPayment = async (amount: number, paymentMethod: string, userEmail: string, currency: string) => {
//   try {
//     // Simulate or integrate with a payment gateway here
//     const response = await axios.post(
//       'https://api.paystack.co/transaction/initialize',
//       {
//         amount: amount,
//         email: userEmail,
//         payment_method: paymentMethod,
//         currency: currency,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         },
//       }
//     );

//     if (response.data.status) {
//       const transactionId = response.data.data.reference;

//       // Check if a payment record already exists for the transaction
//       let paymentRecord = await Payment.findOne({ transactionId });

//       if (paymentRecord) {
//         // Update the existing payment record
//         paymentRecord.amount = amount;
//         currency = paymentRecord.currency;
//         paymentRecord.paymentMethod = paymentMethod;
//         paymentRecord.paymentStatus = 'Pending'; // Set the initial status
//       } else {
//         // Create a new payment record
//         paymentRecord = new Payment({
//           userEmail,
//           amount,
//           currency,
//           paymentMethod,
//           transactionId,
//           paymentStatus: 'Pending', // Set the initial status
//           paymentDate: new Date(),
//         });
//       }

//       // Save the record
//       await paymentRecord.save();

//       return {
//         success: true,
//         transactionId: transactionId,
//         authorizationUrl: response.data.data.authorization_url, // URL for payment authorization
//       };
//     } else {
//       return {
//         success: false,
//         error: response.data.message,
//       };
//     }
//   } catch (error: any) {
//     console.error('Error processing payment:', error.response?.data || error.message);
//     return {
//       success: false,
//       error: error.response?.data?.message || 'Payment processing failed',
//     };
//   }
// };

// // Function to verify payment
// export const verifyPayment = async (transactionId: string) => {
//   try {
//     // Verify the transaction using Paystack's endpoint
//     const response = await axios.get(
//       `https://api.paystack.co/transaction/verify/${transactionId}`,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         },
//       }
//     );

//     if (response.data.status) {
//       const paymentStatus = response.data.data.status; 

//       // Find the payment record in the database
//       const paymentRecord = await Payment.findOne({ transactionId });

//       if (!paymentRecord) {
//         return {
//           success: false,
//           error: 'Payment record not found in the database',
//         };
//       }

//       // Update the payment record with the verified status
//       paymentRecord.paymentStatus = paymentStatus;

//       // Save the updated record
//       await paymentRecord.save();

//       return {
//         success: true,
//         paymentStatus: paymentStatus,
//         message: `Payment status updated to ${paymentStatus}`,
//       };
//     } else {
//       return {
//         success: false,
//         error: response.data.message,
//       };
//     }
//   } catch (error: any) {
//     console.error('Error verifying payment:', error.response?.data || error.message);
//     return {
//       success: false,
//       error: error.response?.data?.message || 'Payment verification failed',
//     };
//   }
// };

// // Function to mark payment as successful
// export const markPaymentAsSuccess = async (transactionId: string) => {
//   try {
//     // Simulate or integrate with Paystack's success endpoint
//     const response = await axios.post(
//       'https://api.paystack.co/transaction/charge_authorization',
//       {
//         reference: transactionId,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         },
//       }
//     );

//     if (response.data.status) {
//       // Find the payment record in the database
//       const paymentRecord = await Payment.findOne({ transactionId });

//       if (!paymentRecord) {
//         return {
//           success: false,
//           error: 'Payment record not found in the database',
//         };
//       }

//       // Update the payment status to 'Success'
//       paymentRecord.paymentStatus = 'Success';
//       await paymentRecord.save();

//       return {
//         success: true,
//         message: 'Payment marked as successful and database updated',
//       };
//     } else {
//       return {
//         success: false,
//         error: response.data.message,
//       };
//     }
//   } catch (error: any) {
//     console.error('Error marking payment as success:', error.response?.data || error.message);
//     return {
//       success: false,
//       error: error.response?.data?.message || 'Payment success processing failed',
//     };
//   }
// };

// // Function to mark payment as failed
// export const markPaymentAsFailed = async (transactionId: string) => {
//   try {
//     // Simulate or integrate with Paystack's failure endpoint
//     const response = await axios.post(
//       'https://api.paystack.co/transaction/charge_authorization',
//       {
//         reference: transactionId,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         },
//       }
//     );

//     if (response.data.status) {
//       // Find the payment record in the database
//       const paymentRecord = await Payment.findOne({ transactionId });

//       if (!paymentRecord) {
//         return {
//           success: false,
//           error: 'Payment record not found in the database',
//         };
//       }

//       // Update the payment status to 'Failed'
//       paymentRecord.paymentStatus = 'Failed';
//       paymentRecord.failureReason = response.data.data.message || 'Payment marked as failed by Paystack';
//       await paymentRecord.save();

//       return {
//         success: true,
//         message: 'Payment marked as failed and database updated',
//       };
//     } else {
//       return {
//         success: false,
//         error: response.data.message,
//       };
//     }
//   } catch (error: any) {
//     console.error('Error marking payment as failed:', error.response?.data || error.message);
//     return {
//       success: false,
//       error: error.response?.data?.message || 'Payment failure processing failed',
//     };
//   }
// };


// // Function to process refunds
// export const refundPayment = async (transactionId: string) => {
//   try {
//     // Simulate or integrate with Paystack's refund endpoint
//     const response = await axios.post(
//       'https://api.paystack.co/refund',
//       {
//         transaction: transactionId,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         },
//       }
//     );

//     if (response.data.status) {
//       // Find the payment record in the database
//       const paymentRecord = await Payment.findOne({ transactionId });

//       if (!paymentRecord) {
//         return {
//           success: false,
//           error: 'Payment record not found in the database',
//         };
//       }

//       // Update the payment status to 'Refunded'
//       paymentRecord.paymentStatus = 'Refunded';
//       paymentRecord.refundDetails = {
//         status: 'Success',
//         message: response.data.data.message || 'Refund processed successfully',
//         Date: new Date(),
//       };
//       await paymentRecord.save();

//       return {
//         success: true,
//         message: 'Payment refunded successfully and database updated',
//       };
//     } else {
//       return {
//         success: false,
//         error: response.data.message,
//       };
//     }
//   } catch (error: any) {
//     console.error('Error processing refund:', error.response?.data || error.message);
//     return {
//       success: false,
//       error: error.response?.data?.message || 'Refund processing failed',
//     };
//   }
// };


// export default { processPayment, verifyPayment, markPaymentAsSuccess, markPaymentAsFailed, refundPayment };