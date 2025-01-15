import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token for a user
 * @param userId - The ID of the user
 * @returns A signed JWT token
 */
const generateToken = (userId: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  // Create the token with the user's ID as payload
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1h', // Token expires in 1 hour
  });
};

export default generateToken;
