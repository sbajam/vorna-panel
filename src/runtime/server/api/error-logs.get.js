// src/runtime/server/api/error-logs.get.js
import { defineEventHandler, getQuery } from "h3";
import { prisma } from "#vorna-utils/db";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const page = Math.max(Number(query.page) || 1, 1);
  const perPage = Math.max(Number(query.perPage) || 20, 1);
  const search = query.search || "";

  // فیلتر جستجو روی username یا URL
  const whereCondition = search
    ? {
        OR: [
          { username: { contains: search, mode: "insensitive" } },
          { url: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  // تعداد کل رکوردها برای pagination
  const totalCount = await prisma.errorLog.count({ where: whereCondition });

  // واکشی رکوردها با مرتب‌سازی نزولی بر اساس timestamp
  const rawLogs = await prisma.errorLog.findMany({
    where: whereCondition,
    orderBy: { timestamp: "desc" },
    skip: (page - 1) * perPage,
    take: perPage,
  });

  // نگاشت رکوردها به آبجکت نهایی که به کلاینت ارسال می‌شود
  const logs = rawLogs.map((log) => ({
    id: Number(log.id),
    username: log.username,
    type: log.type,
    url: log.url,
    lastRoute: log.lastRoute,
    user_agent: log.user_agent,
    ip: log.ip,
    timestamp: log.timestamp,
    device: log.device,
    os: log.os,
    browser: log.browser,
    location: log.location,
    details: log.details,       // اینجا JSON جزییات کامل خطا
    screenshot: log.screenshot,
  }));

  return {
    data: logs,
    meta: {
      total: totalCount,
      page,
      perPage,
      totalPages: Math.ceil(totalCount / perPage),
    },
  };
});
