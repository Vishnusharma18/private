import { PrismaClient } from "@prisma/client";

// Extend globalThis to include `prisma` for TypeScript type safety
declare global {
  var prisma: PrismaClient | undefined;
}

// Create a single PrismaClient instance and reuse it in development
export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Assign the PrismaClient instance to globalThis in development to prevent multiple instances
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
