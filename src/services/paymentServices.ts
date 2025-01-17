import axios from 'axios';

// Function to process payment
export const processPayment = async (amount: number, paymentMethod: string, userEmail: string) => {
  try {
    // Simulate or integrate with a payment gateway here
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        amount: amount * 100, // Convert to kobo for Paystack
        // Get user email from the authenticated user
        email: userEmail,
        payment_method: paymentMethod,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // Replace with your Paystack secret key
        },
      }
    );

    if (response.data.status) {
      return {
        success: true,
        transactionId: response.data.data.reference, // Paystack's transaction reference
      };
    } else {
      return {
        success: false,
        error: response.data.message,
      };
    }
  } catch (error: any) {
    console.error('Error processing payment:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Payment processing failed',
    };
  }
};

// Function to process refunds
export const refundPayment = async (transactionId: string) => {
  try {
    // Simulate or integrate with a refund endpoint here
    const response = await axios.post(
      'https://api.paystack.co/refund',
      {
        transaction: transactionId,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (response.data.status) {
      return {
        success: true,
      };
    } else {
      return {
        success: false,
        error: response.data.message,
      };
    }
  } catch (error: any) {
    console.error('Error processing refund:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Refund processing failed',
    };
  }
};
