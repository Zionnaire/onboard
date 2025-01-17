import { Request, Response } from 'express';
import User from '../models/users';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/token';
import nodemailer from 'nodemailer';


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

// Method to Recover Password
const recoverPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    // Find the user by email
    const user: any = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Generate a random 6-digit code
    const authCode = Math.floor(100000 + Math.random() * 900000);

    // Set the code and expiry date
    user.authCode = authCode;
    user.authCodeExpiry = new Date(Date.now() + 600000); // 10 minutes
    await user.save();

    // Email sending logic
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // or use your email provider
      auth: {
        user: process.env.EMAIL_USERNAME, // Your email
        pass: process.env.EMAIL_PASSWORD, // Your email password or app password
      },
    });

    const mailOptions = {
      from: '"Your App Name" <no-reply@yourapp.com>', // Sender address
      to: email, // Recipient's email
      subject: 'Password Recovery Code', // Subject line
      text: `Your password recovery code is: ${authCode}. This code will expire in 10 minutes.`, // Plain text body
      html: `<p>Your password recovery code is: <strong>${authCode}</strong>.</p><p>This code will expire in 10 minutes.</p>`, // HTML body
    };

    await transporter.sendMail(mailOptions);

    console.log('Auth code sent to email:', email);

    res.status(200).json({ message: 'Recovery code sent successfully' });
  } catch (error) {
    console.error('Error recovering password:', error);
    res.status(500).json({ message: 'An error occurred while recovering the password', error });
  }
};

// Method for Forget password
const forgetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, authCode, newPassword } = req.body;

    // Validate input
    if (!email || !authCode || !newPassword) {
      res.status(400).json({ message: 'Email, auth code, and new password are required' });
      return;
    }

    // Find the user by email
    const user: any = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if the auth code is valid
    if (authCode !== user.authCode || new Date() > user.authCodeExpiry) {
      res.status(401).json({ message: 'Invalid or expired auth code' });
      return;
    }

    // Update the password
    user.password = newPassword;
    user.authCode = null;
    user.authCodeExpiry = null;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'An error occurred while updating the password', error });
  }
};

// Resend auth code with expiration
const resendAuthCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    // Find the user by email
    const user: any = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Generate a new random 6-digit code
    const authCode = Math.floor(100000 + Math.random() * 900000);

    // Set the code and expiry date
    user.authCode = authCode;
    user.authCodeExpiry = new Date(Date.now() + 600000); // 10 minutes
    await user.save();

    // Email sending logic
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // or use your email provider
      auth: {
        user: process.env.EMAIL_USERNAME, 
        pass: process.env.EMAIL_PASSWORD, 
      },
    });

    const mailOptions = {
      from: '"Your App Name" <no-reply@yourapp.com>', // Sender address
      to: email, // Recipient's email
      subject: 'Password Recovery Code', // Subject line
      text: `Your password recovery code is: ${authCode}. This code will expire in 10 minutes.`, // Plain text body
      html: `<p>Your password recovery code is: <strong>${authCode}</strong>.</p><p>This code will expire in 10 minutes.</p>`, // HTML body
    };

    await transporter.sendMail(mailOptions);

    // console.log('Auth code sent to email:', email);

    res.status(200).json({ message: 'Recovery code sent successfully' });

  } catch (error) {
    console.error('Error resending auth code:', error);
    res.status(500).json({ message: 'An error occurred while resending the auth code', error });
  }


}

export { register, login, recoverPassword, forgetPassword, resendAuthCode };
