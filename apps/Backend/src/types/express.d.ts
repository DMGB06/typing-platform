import { CurrentUser } from './user.types';

declare global {
  namespace Express {
    // Extiende la interfaz Request
    interface Request {
      user: CurrentUser;
    }
  }
}

export {};
