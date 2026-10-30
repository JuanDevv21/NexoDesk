import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE.ENV !== 'production') globalForPrisma.prisma = prisma
