# Nobzo Blog API

A robust RESTful API for a blog platform built with Node.js, Express, MongoDB, and Bun.

## Features

- **Dual Authentication**: Supports both **JWT Bearer tokens** in headers and **Secure HTTP-only Cookies**.
- **Token Blacklisting**: Real-time token invalidation upon logout using a server-side blacklist with TTL cleanup.
- **Automated Documentation**: Interactive API reference powered by [Scalar](http://localhost:5000/reference), automatically generated from Zod schemas to ensure 100% accuracy.
- **Smart Filtering**:
  - **Authenticated**: Defaults to showing your own posts (drafts + published).
  - **Public**: Shows all published posts.
  - **Customizable**: Filter by author, tags, or search keywords.
- **Standardized Responses**: Consistent success/error formats for easy client-side integration.
- **Soft Deletion**: Posts are safely marked as deleted rather than permanently removed.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: MongoDB (via [Mongoose](https://mongoosejs.com/))
- **Validation**: [Zod](https://zod.dev/)
- **Documentation**: [Scalar](https://scalar.com/) & `@asteasolutions/zod-to-openapi`

## Setup Instructions

### 1. Prerequisites

- Bun installed.
- MongoDB instance running.

### 2. Installation

```bash
bun install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blog-api
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### 4. Running the Application

```bash
# Development mode
bun dev

# Production mode
bun start
```

## API Reference

The API documentation is interactive and available at:
`http://localhost:5000/reference`

The raw OpenAPI JSON can be found at:
`http://localhost:5000/openapi.json`

## Standardized Response Format

### Success

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional descriptive message"
}
```

### Error

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": [ ... ]
  }
}
```

## Core Endpoints

### Auth

- `POST /api/auth/register`: Create account & sign in via cookie.
- `POST /api/auth/login`: Sign in (returns token + sets cookie).
- `POST /api/auth/logout`: Invalidate session & clear cookie.

### Posts

- `GET /api/posts`: List posts (filtered based on auth state).
- `POST /api/posts`: Create a new post.
- `GET /api/posts/{slug}`: Get a specific published post.
- `PUT /api/posts/{id}`: Update your own post.
- `DELETE /api/posts/{id}`: Soft delete your own post.
