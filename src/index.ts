import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { apiReference } from "@scalar/express-api-reference";
import authRoutes from "./routes/auth";
import postRoutes from "./routes/posts";
import { errorHandler } from "./middleware/error";
import { env } from "./config/env";
import { generateOpenApi } from "./utils/openapi";

const app = express();
const PORT = env.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// Main route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Nobzo Blog API" });
});

// Scalar API Reference
app.use(
  "/reference",
  apiReference({
    theme: "purple",
    url: "/openapi.json",
  }),
);

// OpenAPI JSON
app.get("/openapi.json", (req, res) => {
  res.json(generateOpenApi());
});

// Error handling
app.use(errorHandler);

// Database connection
const MONGODB_URI = env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

if (env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
    console.log(`API Reference: http://localhost:${PORT}/reference`);
  });
}

export default app;
