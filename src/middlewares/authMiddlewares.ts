import { Request, Response, NextFunction } from 'express';
const jwt = require('jsonwebtoken');
import  User  from '../models/users'; // Import the User type

const signJwt = (payload: object) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '2h',
  });
  return token;
};

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (
      !authorizationHeader ||
      !authorizationHeader.toLowerCase().startsWith('bearer ')
    ) {
      res.status(400).json({ message: 'Invalid authorization header' })
      return ;
    }

    const token = authorizationHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // This should now work without TypeScript errors
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    if ((error as any).name === 'TokenExpiredError') {
      res.status(401).json({ status: 3, message: 'Token has expired' })
      return;
    }
     res.status(401).json({ message: 'Invalid token' })
     return;
  }
};

const authMiddleware = {
  signJwt,
  verifyToken,
};

export default authMiddleware;
