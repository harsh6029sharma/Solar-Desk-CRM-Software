import type { TokenPayload } from "../modules/auth/auth.types.js";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}