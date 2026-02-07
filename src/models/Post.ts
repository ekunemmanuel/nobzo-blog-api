import mongoose, { Schema } from "mongoose";
import { IPost } from "../types";

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    tags: [{ type: String }],
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

// Index for search
postSchema.index({ title: "text", content: "text" });

export const Post = mongoose.model<IPost>("Post", postSchema);
