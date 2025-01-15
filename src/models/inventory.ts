import mongoose, { Schema, Document } from 'mongoose';

interface IInventory extends Document {
  name: string;
  quantity: number;
  price: number;
  userId: mongoose.Schema.Types.ObjectId; // Reference to the user
}

const InventorySchema = new Schema<IInventory>({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
});

const Inventory = mongoose.model<IInventory>('Inventory', InventorySchema);

export default Inventory;
