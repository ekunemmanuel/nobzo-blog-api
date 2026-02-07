import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const registerSchema = z
  .object({
    body: z.object({
      name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .openapi({ example: "John Doe" }),
      email: z
        .email("Invalid email format")
        .openapi({ example: "john@example.com" }),
      password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .openapi({ example: "password123" }),
    }),
  })
  .openapi("Register");

export const loginSchema = z
  .object({
    body: z.object({
      email: z
        .email("Invalid email format")
        .openapi({ example: "john@example.com" }),
      password: z
        .string()
        .min(1, "Password is required")
        .openapi({ example: "password123" }),
    }),
  })
  .openapi("Login");

export type RegisterBody = z.infer<typeof registerSchema>["body"];
export type LoginBody = z.infer<typeof loginSchema>["body"];
