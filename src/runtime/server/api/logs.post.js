// server/api/logs.post.js
import { defineEventHandler, readBody, getRequestHeader } from "h3";
import { prisma } from "../utils/db";

const MAX_USER_LOG_COUNT = 100_000; // حداکثر تعداد رکورد در جدول userLog
const SIX_MONTHS_AGO = (() => {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d;
})();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // استخراج IP
  let ip;
  const xff = getRequestHeader(event, "x-forwarded-for");
  if (xff) {
    ip = Array.isArray(xff) ? xff[0] : xff;
  } else {
    // @ts-ignore
    ip = event.node.req.socket.remoteAddress || "";
  }

  try {
    // ۱) درج رکورد جدید
    await prisma.userLog.create({
      data: {
        username: body.username || "guest",
        type: body.type,
        url: body.url,
        method: body.method || null,
        status: body.status || null,
        params: body.params || {},
        responseData: body.responseData || null,
        user_agent: body.userAgent,
        ip,
        device: body.device || null,
        os: body.os || null,
        browser: body.browser || null,
        location: body.location || null,
        // timestamp به‌صورت پیش‌فرض now() تنظیم می‌شود
      },
    });

    // ۲) بررسی تعداد رکوردها
    const totalCount = await prisma.userLog.count();
    if (totalCount > MAX_USER_LOG_COUNT) {
      // حذف رکوردهایی که بیش از ۶ ماه از timestamp شان گذشته
      await prisma.userLog.deleteMany({
        where: { timestamp: { lt: SIX_MONTHS_AGO } },
      });
    }

    return { success: true };
  } catch (e) {
    console.error("[logs.post] Failed to save or prune log:", e);
    return { success: false };
  }
});
