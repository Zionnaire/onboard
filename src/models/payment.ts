import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  amount: number;
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Completed' | 'Refunded' | 'Success' | 'Failed';
  transactionId: string;
  paymentDate: Date;
}

const PaymentSchema = new Schema<IPayment>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { 
    type: String, 
    required: true, 
    enum: ['Pending', 'Completed', 'Refunded', 'Success', 'Failed'],
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
