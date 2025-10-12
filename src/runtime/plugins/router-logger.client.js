// src/runtime/plugins/router-logger.client.js
import { defineNuxtPlugin, useNuxtApp } from "#imports";
import {UAParser} from "ua-parser-js";
import { useUserStore } from "#vorna-stores/user"; // مسیر را با ساختار پروژه‌ات هماهنگ کن

export default defineNuxtPlugin((nuxtApp) => {
  const router = nuxtApp.$router;
  if (!router) return;

  const parser = new UAParser();
  const userStore = useUserStore();

  // هر بار که مسیر تغییر کند (از to به from)
  router.afterEach((to, from) => {
    // ۱. نام کاربری از Pinia
    const username = userStore.username || "guest";

    // ۲. parse کردن User-Agent
    const uaResult = parser.setUA(navigator.userAgent).getResult();

    // ۳. ساخت payload لاگ
    const logPayload = {
      username,
      type: "PAGE_VIEW",          // اگر enum داری: LogType.PAGE_VIEW
      url: to.fullPath,           // مسیر صفحهٔ جدید
      method: "GET",              // همیشه GET برای page_view
      status: 200,                // فرض می‌کنیم نمایش صفحه موفق بوده
      params: {},                 // در page_view پارامتر خاصی نمی‌فرستیم
      userAgent: navigator.userAgent,
      device: uaResult.device.type || "Desktop",
      os:
        uaResult.os.name +
        (uaResult.os.version ? " " + uaResult.os.version : ""),
      browser:
        uaResult.browser.name +
        (uaResult.browser.version ? " " + uaResult.browser.version : ""),
      location: null              // اگر GeoIP داری، اینجا مقدار دهی کن
    };

    // ۴. ارسال لاگ به /api/logs به صورت fire-and-forget
    fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(logPayload),
    }).catch(() => {
      /* fail silent */
    });
  });
});
// این پلاگین هر بار که مسیر تغییر می‌کند، لاگ مربوط به نمایش صفحه را به سرور ارسال می‌کند.
// این کار به صورت غیرهمزمان انجام می‌شود و در صورت بروز خطا، هیچ پیامی نمایش داده نمی‌شود.