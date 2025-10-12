// src/runtime/server/api/error-logs.post.js
import { defineEventHandler, readBody, getRequestHeader } from "h3";
import { prisma } from "../utils/db";

const MAX_ERROR_LOG_COUNT = 10_000; // حداکثر تعداد رکورد در جدول errorLog
const SIX_MONTHS_AGO = (() => {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d;
})();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // استخراج IP اگر لازم باشد
  let ip = body.ip ?? null;
  if (!ip) {
    const xff = getRequestHeader(event, "x-forwarded-for");
    if (xff) {
      ip = Array.isArray(xff) ? xff[0] : xff;
    } else {
      // @ts-ignore
      ip = event.node.req.socket.remoteAddress || null;
    }
  }

  try {
    // ۱) درج رکورد جدید
    await prisma.errorLog.create({
      data: {
        username: body.username,
        type: body.type,
        url: body.url,
        lastRoute: body.lastRoute || null,
        user_agent: body.user_agent,
        ip,
        timestamp: new Date(body.timestamp),
        device: body.device || null,
        os: body.os || null,
        browser: body.browser || null,
        location: body.location || null,
        details: body.details || null,
        screenshot: body.screenshot || null,
      },
    });

    // ۲) بررسی تعداد رکوردها
    const totalCount = await prisma.errorLog.count();
    if (totalCount > MAX_ERROR_LOG_COUNT) {
      // حذف رکوردهایی که بیش از ۶ ماه از timestamp شان گذشته
      await prisma.errorLog.deleteMany({
        where: { timestamp: { lt: SIX_MONTHS_AGO } },
      });
    }

    return { success: true };
  } catch (e) {
    console.error("[error-logs.post] Failed to save or prune error log:", e);
    return { success: false };
  }
});
