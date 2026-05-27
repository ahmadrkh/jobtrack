import { PrismaClient } from '@prisma/client'

// Prevent multiple Prisma Client instances in development (hot reload creates
// new module instances; this pattern reuses the same client each time).
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['query'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
