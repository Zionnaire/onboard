import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: string;
  failureReason?: null | string;
  paymentStatus: 'Pending' | 'Completed' | 'Refunded' | 'Success' | 'Failed';
  transactionId: string;
  paymentDate: Date;
  refundDetails: {
    status: 'Pending' | 'Completed' | 'Failed' | 'Success';
    message: string;
    Date: Date;
  };
}

const PaymentSchema = new Schema<IPayment>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: 'NGN', enum: ['NGN', 'USD', 'EUR'] },
  paymentMethod: { type: String},
  paymentStatus: { 
    type: String, 
    required: true, 
    enum: ['Pending', 'Completed', 'Refunded', 'Success', 'Failed'],
  },
  failureReason: { type: String },
  refundDetails:{
    status: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Success'] },
    message: { type: String },
    Date: {
      type: Date,
      default: Date.now,
    },
  },
  transactionId: { 
    type: String, 
    required: true, 
    unique: true, 
    minlength: 5, // Adjust based on expected length
  },
  paymentDate: { 
    type: Date, 
    required: true, 
    default: Date.now, 
  },
});

const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);

export { Payment };
