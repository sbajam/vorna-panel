// playground/src/runtime/server/api/error-logs.post.ts
import { defineEventHandler, readBody, getRequestHeader } from "h3";
import { prisma } from "../utils/db";

export default defineEventHandler(async (event) => {
  // 1. خواندن body
  const body = (await readBody(event)) as {
    username: string;
    type: string;          // NAVIGATION, COMPONENT, UNHANDLED_REJECTION, API_ERROR
    url: string;
    lastRoute?: string | null;
    user_agent: string;
    ip?: string | null;
    timestamp: string;     // حتماً ISO string
    device?: string | null;
    os?: string | null;
    browser?: string | null;
    location?: any;        // می‌تواند JSON باشد

    details?: any;         // JSON کلیهٔ جزئیات
    screenshot?: string | null;
  };

  // 2. در صورت لزوم، خودمان IP را از هدر بگیریم (اما چون در پلاگین گرفتیم، body.ip کافیست)
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

  // 3. درج رکورد در جدول ErrorLog
  try {
    await prisma.errorLog.create({
      data: {
        username: body.username,
        type: body.type as any,   // Prisma enum
        url: body.url,
        lastRoute: body.lastRoute || null,
        user_agent: body.user_agent,
        ip,
        timestamp: new Date(body.timestamp), // Prisma DateTime
        device: body.device || null,
        os: body.os || null,
        browser: body.browser || null,
        location: body.location || null,
        details: body.details || null,
        screenshot: body.screenshot || null,
      },
    });
    return { success: true };
  } catch (e) {
    console.error("[error-logs.post] Failed to save error log:", e);
    return { success: false };
  }
});
