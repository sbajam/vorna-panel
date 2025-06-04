// server/utils/db.ts
import { PrismaClient } from '@prisma/client'

declare global {
  // برای جلوگیری از چندین ایجاد instance در حالت dev/watch
  // @ts-ignore
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query'] // این خط اختیاری است؛ اگر می‌خواهی همهٔ کوئری‌ها را در کنسول ببینی.
  })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
