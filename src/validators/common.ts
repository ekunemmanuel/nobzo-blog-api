import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const successResponseSchema = (dataSchema: z.ZodTypeAny) =>
  z.object({
    success: z.boolean().openapi({ example: true }),
    data: dataSchema,
    message: z.string().optional().openapi({ example: "Operation successful" }),
  });

export const errorResponseSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  error: z.object({
    message: z.string().openapi({ example: "Internal Server Error" }),
    details: z
      .array(z.any())
      .optional()
      .openapi({
        example: [{ path: "email", message: "Invalid email format" }],
      }),
  }),
});

export const userResponseSchema = z.object({
  id: z.string().openapi({ example: "60d0fe4f5311236168a109ca" }),
  name: z.string().openapi({ example: "John Doe" }),
  email: z.email().openapi({ example: "john@example.com" }),
});

export const postResponseSchema = z.object({
  id: z.string().openapi({ example: "60d0fe4f5311236168a109ca" }),
  title: z.string().openapi({ example: "My First Blog Post" }),
  slug: z.string().openapi({ example: "my-first-blog-post" }),
  content: z.string().openapi({ example: "Content of the post..." }),
  status: z.enum(["draft", "published"]).openapi({ example: "published" }),
  tags: z.array(z.string()).openapi({ example: ["tech", "node"] }),
  author: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    })
    .openapi({
      example: { id: "123", name: "John", email: "john@example.com" },
    }),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const postListResponseSchema = z.object({
  posts: z.array(postResponseSchema),
  pagination: z.object({
    total: z.number().openapi({ example: 100 }),
    page: z.number().openapi({ example: 1 }),
    limit: z.number().openapi({ example: 10 }),
    pages: z.number().openapi({ example: 10 }),
  }),
});
