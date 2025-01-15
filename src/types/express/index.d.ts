import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { id: string; name: string; email: string }; // Extend with your user properties
    }
  }
}
