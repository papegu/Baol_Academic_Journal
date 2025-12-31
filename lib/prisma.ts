import { PrismaClient } from '../app/generated/prisma';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };
let prismaInstance: PrismaClient | undefined;

export function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = globalForPrisma.prisma || new PrismaClient();
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = prismaInstance;
    }
  }
  return prismaInstance;
}