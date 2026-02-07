import { Request, Response } from "express";
import { Post } from "../models/Post";
import { generateSlug, catchAsync } from "../utils";
import {
  CreatePostBody,
  UpdatePostBody,
  UpdatePostParams,
  GetPostsQuery,
  GetPostBySlugParams,
  ParamsId,
} from "../validators/posts";

export const createPost = catchAsync(
  async (req: Request<{}, {}, CreatePostBody>, res: Response) => {
    const { title, content, status, tags } = req.body;
    const author = req.user!.id;
    const slug = generateSlug(title);

    const post = new Post({
      title,
      slug,
      content,
      author,
      status,
      tags,
    });

    await post.save();
    res.status(201).json({
      success: true,
      data: post,
    });
  },
);

export const getPosts = catchAsync(
  async (req: Request<{}, {}, {}, GetPostsQuery>, res: Response) => {
    const { page, limit, search, tag, author, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = { deletedAt: null };

    if (search) {
      query.$text = { $search: search };
    }

    if (tag) {
      query.tags = tag;
    }

    // Default to current user's posts if logged in and no author specified
    const targetAuthor = author || (req.user ? req.user.id : undefined);

    if (targetAuthor) {
      query.author = targetAuthor;
    }

    // Authorization logic for status
    if (req.user) {
      const isViewingOwnPosts = !author || author === req.user.id;

      if (status) {
        if (status === "draft") {
          // Can only see drafts of your own posts
          query.status = "draft";
          query.author = req.user.id;
        } else {
          query.status = "published";
        }
      } else {
        if (isViewingOwnPosts) {
          // If viewing own posts, see both draft and published
          query.$or = [
            { status: "published", author: req.user.id },
            { status: "draft", author: req.user.id },
          ];
        } else {
          // If viewing someone else's posts, only see published
          query.status = "published";
        }
      }
    } else {
      // Public users only see published
      query.status = "published";
    }

    const posts = await Post.find(query)
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  },
);

export const getPostBySlug = catchAsync(
  async (req: Request<GetPostBySlugParams>, res: Response) => {
    const { slug } = req.params;
    const post = await Post.findOne({
      slug,
      status: "published",
      deletedAt: null,
    }).populate("author", "name email");

    if (!post) {
      return res.status(404).json({
        success: false,
        error: { message: "Post not found" },
      });
    }

    res.json({
      success: true,
      data: post,
    });
  },
);

export const updatePost = catchAsync(
  async (req: Request<UpdatePostParams, {}, UpdatePostBody>, res: Response) => {
    const { id } = req.params;
    const { title, content, status, tags } = req.body;

    const post = await Post.findOne({ _id: id, deletedAt: null });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: { message: "Post not found" },
      });
    }

    if (post.author.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: { message: "Not authorized to update this post" },
      });
    }

    if (title) {
      post.title = title;
      post.slug = generateSlug(title);
    }
    if (content) post.content = content;
    if (status) post.status = status;
    if (tags) post.tags = tags;

    await post.save();
    res.json({
      success: true,
      data: post,
    });
  },
);

export const deletePost = catchAsync(
  async (req: Request<ParamsId>, res: Response) => {
    const { id } = req.params;

    const post = await Post.findOne({ _id: id, deletedAt: null });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: { message: "Post not found" },
      });
    }

    if (post.author.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: { message: "Not authorized to delete this post" },
      });
    }

    post.deletedAt = new Date();
    await post.save();

    res.json({
      success: true,
      message: "Post soft deleted successfully",
    });
  },
);
