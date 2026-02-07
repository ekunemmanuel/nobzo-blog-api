import { Document, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

export interface IPost extends Document {
  title: string;
  slug: string;
  content: string;
  author: Types.ObjectId | IUser;
  status: "draft" | "published";
  tags: string[];
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}
