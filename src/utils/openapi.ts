import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  RouteConfig,
} from "@asteasolutions/zod-to-openapi";
import { registerSchema, loginSchema } from "../validators/auth";
import {
  createPostSchema,
  updatePostSchema,
  getPostsSchema,
  getPostBySlugSchema,
  paramsIdSchema,
} from "../validators/posts";
import {
  successResponseSchema,
  errorResponseSchema,
  userResponseSchema,
  postResponseSchema,
  postListResponseSchema,
} from "../validators/common";
import { z } from "zod";

const registry = new OpenAPIRegistry();

// Define Security Scheme
registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

registry.registerComponent("securitySchemes", "cookieAuth", {
  type: "apiKey",
  in: "cookie",
  name: "token",
});

/**
 * Helper to register a route with standard success and error responses.
 */
function registerEndpoint(
  config: Omit<RouteConfig, "responses"> & {
    successData: z.ZodTypeAny;
    successDescription?: string;
    successStatus?: number;
    errors?: (400 | 401 | 403 | 404 | 500)[];
    errorMessages?: Record<number, string>;
  },
) {
  const responses: RouteConfig["responses"] = {
    [config.successStatus || 200]: {
      description: config.successDescription || "Operation successful",
      content: {
        "application/json": {
          schema: successResponseSchema(config.successData),
        },
      },
    },
  };

  const errorMap = {
    400: "Validation failed or bad request",
    401: "Unauthorized - Authentication required",
    403: "Forbidden - Insufficient permissions",
    404: "Resource not found",
    500: "Internal server error",
  };

  const selectedErrors: (400 | 401 | 403 | 404 | 500)[] = config.errors || [
    400, 500,
  ];

  if (config.security && !selectedErrors.includes(401)) {
    selectedErrors.push(401);
  }

  // Update security to support both bearer and cookie
  if (config.security) {
    config.security = config.security.map((sec) => {
      if (sec.bearerAuth) {
        return { ...sec, cookieAuth: [] };
      }
      return sec;
    });
  }

  selectedErrors.forEach((status) => {
    const message =
      config.errorMessages?.[status] ||
      errorMap[status as keyof typeof errorMap] ||
      "An error occurred";

    // Create a specific example for 400 errors based on the request body if available
    let errorSchema = errorResponseSchema;
    if (
      status === 400 &&
      config.request?.body?.content["application/json"]?.schema
    ) {
      const bodySchema = config.request.body.content["application/json"]
        .schema as z.ZodObject<any>;
      if (bodySchema.shape) {
        const firstField = Object.keys(bodySchema.shape)[0];
        errorSchema = errorResponseSchema.openapi({
          example: {
            success: false,
            error: {
              message: "Validation failed",
              details: [{ path: firstField, message: `Invalid ${firstField}` }],
            },
          },
        });
      }
    } else {
      // Use general example for other statuses
      errorSchema = errorResponseSchema.openapi({
        example: {
          success: false,
          error: { message },
        },
      });
    }

    responses[status] = {
      description: message,
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    };
  });

  registry.registerPath({
    ...config,
    responses,
  });
}

// Register Path - Auth
registerEndpoint({
  method: "post",
  path: "/api/auth/register",
  summary: "Register a new user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerSchema.shape.body,
        },
      },
    },
  },
  successStatus: 201,
  successData: z.object({
    token: z.string(),
    user: userResponseSchema,
  }),
  errorMessages: {
    400: "Registration failed (e.g., email already taken or invalid input)",
  },
});

registerEndpoint({
  method: "post",
  path: "/api/auth/login",
  summary: "User login",
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema.shape.body,
        },
      },
    },
  },
  successData: z.object({
    token: z.string(),
    user: userResponseSchema,
  }),
  errorMessages: {
    401: "Invalid email or password",
  },
});

registerEndpoint({
  method: "post",
  path: "/api/auth/logout",
  summary: "User logout",
  successData: z.object({}),
  successDescription: "Logged out successfully",
});

// Register Path - Posts
registerEndpoint({
  method: "get",
  path: "/api/posts",
  summary: "Get all posts",
  request: {
    query: getPostsSchema.shape.query,
  },
  successData: postListResponseSchema,
});

registerEndpoint({
  method: "post",
  path: "/api/posts",
  summary: "Create a post",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createPostSchema.shape.body,
        },
      },
    },
  },
  successStatus: 201,
  successData: postResponseSchema,
});

registerEndpoint({
  method: "get",
  path: "/api/posts/{slug}",
  summary: "Get post by slug",
  request: {
    params: getPostBySlugSchema.shape.params,
  },
  successData: postResponseSchema,
  errors: [404],
});

registerEndpoint({
  method: "put",
  path: "/api/posts/{id}",
  summary: "Update post",
  security: [{ bearerAuth: [] }],
  request: {
    params: updatePostSchema.shape.params,
    body: {
      content: {
        "application/json": {
          schema: updatePostSchema.shape.body,
        },
      },
    },
  },
  successData: postResponseSchema,
  errors: [400, 403, 404],
});

registerEndpoint({
  method: "delete",
  path: "/api/posts/{id}",
  summary: "Delete post",
  security: [{ bearerAuth: [] }],
  request: {
    params: paramsIdSchema.shape.params,
  },
  successData: z.object({}),
  successDescription: "Post deleted successfully",
  errors: [403, 404],
});

export const generateOpenApi = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Blog API",
      description: "Simple Blog API with Node.js and TypeScript",
    },
    servers: [{ url: "/" }],
  });
};
