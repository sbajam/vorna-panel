import { defineEventHandler, getQuery } from 'h3'
import { prisma } from '../utils/db'

export default defineEventHandler(async (event) => {
  // ۱. خواندن پارامترهای query
  const query = getQuery(event)

  const page = Math.max(Number(query.page) || 1, 1)
  const perPage = Math.max(Number(query.perPage) || 20, 1)
  const search = query.search || ''

  const whereCondition = search
    ? {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { url: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {}

  // ۲. گرفتن تعداد کل رکوردها
  const totalCount = await prisma.userLog.count({ where: whereCondition })

  // ۳. واکشی رکوردها با pagination و مرتب‌سازی
  const rawLogs = await prisma.userLog.findMany({
    where: whereCondition,
    orderBy: { timestamp: 'desc' },
  })

  // ۴. تبدیل BigInt به Number (یا String) برای امکان سریالیز کردن
  const logs = rawLogs.map((log) => ({
    id: Number(log.id),           // ← تبدیل BigInt به Number
    username: log.username,
    type: log.type,
    url: log.url,
    method: log.method,
    status: log.status,
    params: log.params,
    responseData: log.responseData,
    user_agent: log.user_agent,
    ip: log.ip,
    timestamp: log.timestamp,
    device: log.device,
    os: log.os,
    browser: log.browser,
    location: log.location,
  }))

  return {
    data: logs,
    meta: {
      total: logs.length,
      page: 1,
      perPage: logs.length,
      totalPages: 1,
    },
  }
})
