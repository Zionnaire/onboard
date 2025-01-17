import { Request, Response } from 'express';
import { initializePayment, verifyWebhook, verifyPayment, completePayment, refundPayment, markPaymentAsSuccess, getPaymentDetails } from '../services/paymentServices';


export const createPayment = async (req: Request, res: Response) => {
  const { userId, amount, currency, email, paymentMethod } = req.body;

  try {
    const result = await initializePayment(userId, amount, currency, email, paymentMethod);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const receivedWebHook = async (req: Request, res: Response) => {
  try {
    await verifyWebhook(req);
    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Webhook processing failed' });
  }
};

// Function to veriffy payment

export const verifyPaymentController = async (req: Request, res: Response) => {
  const { paymentId } = req.params;

  try {
    const result = await getPaymentDetails(paymentId);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ message: errorMessage });
  }
};



export const completePaymentController = async (req: Request, res: Response) => {
  const event = req.body;

  // Immediately acknowledge the webhook
  res.status(200).json({ message: 'Webhook received successfully' });

  try {
    await completePayment(event); // Process the payment asynchronously
    console.log('Payment processed successfully');
  } catch (error) {
    console.error('Error processing payment:', error);
  }
};
export const markPaymentSuccessController = async (req: Request, res: Response) => {
  const { paymentId } = req.params;

  try {
    const result = await markPaymentAsSuccess(paymentId);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ message: errorMessage });
  }
};


export const refundPaymentController = async (req: Request, res: Response) => {
  const { paymentId } = req.params;

  try {
    const result = await refundPayment(paymentId);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ message: errorMessage });
  }
};


export const getPaymentDetailsController = async (req: Request, res: Response) => {
  const { paymentId } = req.params;

  try {
    const result = await getPaymentDetails(paymentId);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ message: errorMessage });
  }
};




// // Create Payment
// export const createPayment = async (req: Request, res: Response) => {
//   const { userId, amount, currency, email, paymentMethod } = req.body;

//   try {
//     // Validate input
//     if (!userId || !amount || !email || !currency) {
//       res.status(400).json({ message: 'Missing required fields' });
//       return;
//     }

//     // Find user in the database
//     const user = await User.findById(userId);
//     if (!user) {
//       res.status(404).json({ message: 'User not found' });
//       return;
//     }

//     // Initialize payment with Paystack
//     const paystackResponse = await axios.post(
//       'https://api.paystack.co/transaction/initialize',
//       { email, amount, currency, paymentMethod, paymentStatus: 'Pending' },
//       { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
//     );
//     // console.log('Full Paystack response:', paystackResponse.data);

//     const { reference, authorization_url } = paystackResponse.data.data;

//     // Save the payment record to the database
//     const payment = new Payment({
//       userId: user._id,
//       amount,
//       currency,
//       paymentMethod: paymentMethod,
//       paymentStatus: 'Pending',
//       transactionId: reference,
//       paymentDate: new Date(),
//     });

//     await payment.save();

//     res.status(201).json({
//       message: 'Payment initialized successfully',
//       payment,
//       authorizationUrl: authorization_url,
//     });
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       console.error(error.response?.data || error.message);
//     } else {
//       console.error(error);
//     }
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };


// export const receivedWebHook = async (req: Request, res: Response) => {
//   const event = req.body;

//   // Immediately respond with a 200 status
//   res.status(200).json({ message: 'Webhook received successfully' });

//   // Perform additional tasks asynchronously
//   try {
//     const secret = process.env.PAYSTACK_SECRET_KEY; // Paystack secret key
//     if (!secret) {
//      res.status(500).json({ message: 'Paystack secret key is not defined' })
//      return;
//     }
//     const signature = req.headers['x-paystack-signature'] as string; // Paystack signature header
  
//     // Validate signature
//     const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
//     if (hash !== signature) {
//    res.status(200).json({ message: 'Invalid signature' })
//    return;
//     }
//     // Log the event or process the payment event
//     console.log('Processing event:', event);

//     // Simulate a long-running task
//     await completePayment(event);
//   } catch (error) {
//     console.error('Error processing webhook event:', error);
//   }
// };


// // Webhook to confirm payment
// export const completePayment = async (event: any) => {
//   try {

//     if (!event || !event.data) {
//       console.error('Invalid event or missing data');
//       return;
//     }

//     const { reference } = event.data;
//     const payment = await Payment.findOne({ transactionId: reference });

//     if (!payment) {
//       console.error('Payment not found for reference:', reference);
//       return;
//     }

//     if (payment.amount !== event.data.amount) {
//       payment.paymentStatus = 'Failed';
//       await payment.save();
//       return;
//     }

//     if (payment.currency !== event.data.currency) {
//       payment.paymentStatus = 'Failed';
//       payment.failureReason = 'Currency mismatch';
//       await payment.save();
//       return;
//     }

//     if (event.event === 'charge.success') {
//       payment.paymentStatus = 'Success';
//     } else {
//       payment.paymentStatus = event.status || 'Failed';
//     }

//     await payment.save();
//   } catch (error: any) {
//     console.error('Error processing webhook:', error.message);
//   }
// };

// // Mark Payment as Success
// export const markPaymentAsSuccess = async (req: Request, res: Response) => {
//   const { paymentId } = req.params; // Or req.body, depending on your API design

//   try {
//     // Find the payment in the database
//     const payment = await Payment.findById(paymentId);
//     if (!payment) {
//        res.status(404).json({ message: 'Payment not found' })
//        return;
//     }

//     // Check if the payment is already marked as success
//     if (payment.paymentStatus === 'Completed') {
//       res.status(400).json({ message: 'Payment is already marked as completed' })
//       return;
//     }

//     // Update payment status to "Success"
//     payment.paymentStatus = 'Success';
//     await payment.save();

//      res.status(200).json({
//       message: 'Payment status updated to success',
//       payment,
//     })
//     return;
//   } catch (error) {
//     console.error('Error marking payment as success:', error);
//     res.status(500).json({ message: 'Internal server error' })
//     return;
//   }
// };

// // Verify Payment
// export const verifyPayment = async (req: Request, res: Response) => {
//   const { reference } = req.query;

//   try {
//     if (!reference) {
//       res.status(400).json({ message: 'Missing payment reference' })
//       return;
//     }

//     // Verify payment with Paystack
//     const paystackResponse = await axios.get(
//       `https://api.paystack.co/transaction/verify/${reference}`,
//       {
//         headers: {
//           Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
//         },
//       }
//     );

//     //const paymentData = paystackResponse.data.data;
//     // Find the payment record in the database
//     const payment = await Payment.findOne({ transactionId: reference });
//     if (!payment) {
//       res.status(404).json({ message: 'Payment not found' })
//       return;
//     }

//     if (payment.paymentStatus === 'Success') {
//       // Update the payment record in the database
//       const payment = await Payment.findOneAndUpdate(
//         { transactionId: reference },
//         { paymentStatus: paystackResponse.data.data.status },
//         { new: true }
//       );

//       res.status(200).json({
//         message: 'Payment verified successfully',
//         payment,
//       })
//       return;
//     } else {
//       res.status(400).json({ message: 'Payment verification failed' })
//       return;
//     }
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       if (axios.isAxiosError(error)) {
//         if (axios.isAxiosError(error)) {
//           if (axios.isAxiosError(error)) {
//             if (axios.isAxiosError(error)) {
//               console.error(error.response?.data || error.message);
//             } else {
//               console.error(error);
//             }
//           } else {
//             console.error(error);
//           }
//         } else {
//           console.error(error);
//         }
//       } else {
//         console.error(error);
//       }
//     } else {
//       console.error(error);
//     }
//     res.status(500).json({ message: 'Internal server error' })
//     return;
//   }
// };

// // Refund Payment
// export const refundPaymentController = async (req: Request, res: Response) => {
//   const { paymentId } = req.params;

//   try {
//     // Find payment record in the database
//     const payment = await Payment.findById(paymentId);
//     if (!payment) {
//       res.status(404).json({ message: 'Payment not found' })
//       return;
//     }

//     // Check if the payment is refundable
//     if (payment.paymentStatus !== 'Completed') {
//       res.status(400).json({ message: 'Payment is not eligible for refund' })
//       return;
//     }

//     // Refund payment via Paystack
//     const refundResponse = await axios.post(
//       'https://api.paystack.co/refund',
//       {
//         transaction: payment.transactionId,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
//         },
//       }
//     );

//     if (refundResponse.data.status) {
//       // Update payment status to refunded
//       payment.paymentStatus = 'Refunded';
//       await payment.save();

//       res.status(200).json({
//         message: 'Payment refunded successfully',
//         payment,
//       })
//       return;
//     } else {
//       res.status(400).json({ message: 'Refund failed', error: refundResponse.data.message })
//       return;
//     }
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       if (axios.isAxiosError(error)) {
//         if (axios.isAxiosError(error)) {
//           if (axios.isAxiosError(error)) {
//             if (axios.isAxiosError(error)) {
//               console.error(error.response?.data || error.message);
//             } else {
//               console.error(error);
//             }
//           } else {
//             console.error(error);
//           }
//         } else {
//           console.error(error);
//         }
//       } else {
//         console.error(error);
//       }
//     } else {
//       console.error(error);
//     }
//     res.status(500).json({ message: 'Internal server error' })
//     return;
//   }
// };

// // Get Payment Details
// export const getPaymentDetails = async (req: Request, res: Response) => {
//   const { paymentId } = req.params;

//   try {
//     const payment = await Payment.findById(paymentId);
//     if (!payment) {
//       res.status(404).json({ message: 'Payment not found' })
//       return;
//     }

//     res.status(200).json({ payment })
//     return;
//   } catch (error) {
//     console.error(error);
//      res.status(500).json({ message: 'Internal server error' })
//      return;
//   }
// };

export default {
  createPayment,
  receivedWebHook,
  completePayment,
  markPaymentAsSuccess,
  refundPaymentController,
  getPaymentDetails,
  verifyPayment
};



