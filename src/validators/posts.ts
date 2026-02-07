import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const createPostSchema = z
  .object({
    body: z.object({
      title: z
        .string()
        .min(1, "Title is required")
        .openapi({ example: "My First Blog Post" }),
      content: z
        .string()
        .min(1, "Content is required")
        .openapi({ example: "This is the content of my first post." }),
      status: z
        .enum(["draft", "published"])
        .optional()
        .openapi({ example: "published" }),
      tags: z
        .array(z.string())
        .optional()
        .openapi({ example: ["tech", "node"] }),
    }),
  })
  .openapi("CreatePost");

export const updatePostSchema = z
  .object({
    params: z.object({
      id: z
        .string()
        .min(1, "ID is required")
        .openapi({ example: "60d0fe4f5311236168a109ca" }),
    }),
    body: z.object({
      title: z.string().optional().openapi({ example: "Updated Title" }),
      content: z.string().optional().openapi({ example: "Updated content." }),
      status: z
        .enum(["draft", "published"])
        .optional()
        .openapi({ example: "published" }),
      tags: z
        .array(z.string())
        .optional()
        .openapi({ example: ["tech", "express"] }),
    }),
  })
  .openapi("UpdatePost");

export const getPostsSchema = z
  .object({
    query: z.object({
      page: z.string().optional().default("1").openapi({ example: "1" }),
      limit: z.string().optional().default("10").openapi({ example: "10" }),
      search: z.string().optional().openapi({ example: "my post" }),
      tag: z.string().optional().openapi({ example: "tech" }),
      author: z
        .string()
        .optional()
        .openapi({ example: "60d0fe4f5311236168a109ca" }),
      status: z
        .enum(["draft", "published"])
        .optional()
        .openapi({ example: "published" }),
    }),
  })
  .openapi("GetPostsQuery");

export const getPostBySlugSchema = z
  .object({
    params: z.object({
      slug: z
        .string()
        .min(1, "Slug is required")
        .openapi({ example: "my-first-blog-post" }),
    }),
  })
  .openapi("GetPostBySlug");

export const paramsIdSchema = z
  .object({
    params: z.object({
      id: z
        .string()
        .min(1, "ID is required")
        .openapi({ example: "60d0fe4f5311236168a109ca" }),
    }),
  })
  .openapi("ParamsId");

export type CreatePostBody = z.infer<typeof createPostSchema>["body"];
export type UpdatePostBody = z.infer<typeof updatePostSchema>["body"];
export type UpdatePostParams = z.infer<typeof updatePostSchema>["params"];
export type GetPostsQuery = z.infer<typeof getPostsSchema>["query"];
export type GetPostBySlugParams = z.infer<typeof getPostBySlugSchema>["params"];
export type ParamsId = z.infer<typeof paramsIdSchema>["params"];
