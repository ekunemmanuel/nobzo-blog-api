import mongoose, { Schema, Document } from "mongoose";

export interface IBlacklistedToken extends Document {
  token: string;
  expiresAt: Date;
}

const blacklistedTokenSchema = new Schema<IBlacklistedToken>(
  {
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// TTL index to automatically remove expired tokens from the blacklist
blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const BlacklistedToken = mongoose.model<IBlacklistedToken>(
  "BlacklistedToken",
  blacklistedTokenSchema,
);
