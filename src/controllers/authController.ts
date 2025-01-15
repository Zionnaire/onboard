import { Request, Response } from 'express';
import User from '../models/users';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/token';

const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
  

    // Validate input
    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email, and password are required' });
      return;
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Create and save the user
    const user: any = new User({ name, email: email.toLowerCase(), password });
    await user.save();

    // Generate a token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'An error occurred while registering the user', error });
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Find the user by email
    const user: any = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ message: 'Invalid email' });
      return;
    }


    // Use the password comparison method from the schema
    const isPasswordValid =  bcrypt.compareSync(password, user.password);
   
    
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid password' });
      return;
    }

    // Generate a token
    const token = generateToken(user._id.toString());
    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'An error occurred during login', error });
  }
};


export { register, login };
