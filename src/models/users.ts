import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  authCode: string;
  authCodeExpiry: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  authCode: { type: String, default: null },
  authCodeExpiry: { type: Date, default: null },
});

// Hash the password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare the provided password with the hashed password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  const compare = await bcrypt.compare(candidatePassword, this.password);
  return compare;
};

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
