// src/runtime/plugins/router-vue-logger.client.js
import { defineNuxtPlugin } from "#imports";
import { UAParser } from "ua-parser-js";
import html2canvas from "html2canvas";
import { useUserStore } from "../stores/user"; // مسیر به استورِ شما

export default defineNuxtPlugin((nuxtApp) => {
  const router = nuxtApp.$router;
  const parser = new UAParser();
  const userStore = useUserStore();

  // برای نگهداری مسیر قبلی
  let lastRoute = null;

  // 0️⃣ هر بار که ناوبری موفق انجام می‌شود، lastRoute را بروز می‌کنیم
  if (router && router.afterEach) {
    router.afterEach((to, from) => {
      lastRoute = from.fullPath;
    });
  }

  // تابع کمکی: گرفتن اسکرین‌شات صفحه (Base64)
// به‌عنوان مثال در src/runtime/plugins/axios-logger.client.ts یا
// در پلاگینِ error-logger-with-details.client.ts

// تابع کمکی: گرفتن اسکرین‌شات صفحه و برگرداندن Base64 (JPEG با کیفیت معقول)
async function captureScreenshot() {
  try {
    // scale را برابر devicePixelRatio قرار می‌دهیم تا رزولوشن مناسبی داشته باشیم
    // اگر بخواهید حجم کمتر باشد می‌توانید scale را روی 0.8 یا 0.7 تنظیم کنید
    const scale = window.devicePixelRatio || 1;

    const canvas = await html2canvas(document.body, {
      scale,        // می‌توانید دستی scale=1 بگذارید یا روی ۰.۸ (راحت‌تر برای حجم کمتر)
      useCORS: true // در صورتی که منابع خارجی (مثل تصاویر) دارید
    });

    // خروجی را به JPEG تبدیل می‌کنیم و با quality حدود 0.6 فشرده می‌کنیم:
    // عدد بین ۰ تا ۱ است: ۰.۶ تقریبا تعادل خوبی بین کیفیت و حجم برقرار می‌کند.
    return canvas.toDataURL("image/jpeg", 0.6);
  } catch (e) {
    console.error("[AxiosLogger] failed to capture screenshot:", e);
    return null;
  }
}


  // تابع کمکی: ارسال payload لاگ به سرور
  async function sendErrorLog(payload) {
    try {
      await fetch("/api/error-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error("[RouterVueLogger] send failed:", e);
    }
  }

  // تابع ساخت payload مشترک برای هر نوع خطا
  async function buildPayload(errorContext) {
    const username = userStore.username || "guest";
    const uaResult = parser.setUA(navigator.userAgent).getResult();
    const screenshot = await captureScreenshot();
    const currentRoute = router.currentRoute.value.fullPath;
    const routeParams = router.currentRoute.value.params;
    const routeQuery = router.currentRoute.value.query;

    // اطلاعات پایه
    const baseInfo = {
      username,
      url: currentRoute,
      lastRoute,
      user_agent: navigator.userAgent,
      ip: null,
      timestamp: new Date().toISOString(),
      device: uaResult.device.type || "Desktop",
      os: uaResult.os.name + (uaResult.os.version ? " " + uaResult.os.version : ""),
      browser: uaResult.browser.name + (uaResult.browser.version ? " " + uaResult.browser.version : ""),
      location: null,
      screenshot,
    };

    // استخراج IP از هدر یا remoteAddress
    try {
      const xff = (await nuxtApp.$h3.getRequestHeader("x-forwarded-for"));
      if (xff) {
        baseInfo.ip = Array.isArray(xff) ? xff[0] : xff;
      } else {
        // @ts-ignore
        baseInfo.ip = nuxtApp.ssrContext?.event?.node?.req?.socket?.remoteAddress ?? null;
      }
    } catch {
      baseInfo.ip = null;
    }

    // ساخت جزئیات اولیه (routeParams, routeQuery، وضعیت صفحه و محیط کاربر)
    const details = {
      routeParams,
      routeQuery,
      clientTimestamp: new Date().toISOString(),
      viewport: { width: window.innerWidth, height: window.innerHeight },
      language: navigator.language,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isOnline: navigator.onLine,
    };

    // ادغام محتوای errorContext (پیام خطا، stack، vueInfo، componentName، formState، requestPayload)
    Object.assign(details, errorContext);

    return {
      ...baseInfo,
      type: errorContext.type, // NAVIGATION, COMPONENT, UNHANDLED_REJECTION
      details,
    };
  }

  // ——— 1️⃣ شناسایی ۴۰۴ (مسیر پیدا‌نشده) در afterEach ———
  if (router && router.afterEach) {
    router.afterEach(async (to) => {
      // اگر هیچ مسیر معادلی پیدا نشده باشد، یعنی Nuxt اینجا ۴۰۴ نمایش داده
      if (to.matched.length === 0) {
        try {
          const errorContext = {
            type: "NAVIGATION",
            errorMessage: `Page not found: ${to.fullPath}`,
            stack: null,
            vueInfo: null,
            componentName: null,
            formState: null,
            requestPayload: null,
          };
          const payload = await buildPayload(errorContext);
          await sendErrorLog(payload);
        } catch {
          /* fail silently */
        }
      }
    });
  }

  // ——— 2️⃣ خطاهای Vue کامپوننت (component errors) ———
  nuxtApp.vueApp.config.errorHandler = async (err, vm, info) => {
    try {
      const componentName = vm?.$options?.name || null;
      // اگر داخل کامپوننت فرم یا state داریم، می‌توانیم آن را اینجا استخراج کنیم
      const formState = null; // در صورت نیاز دستی پر شود

      const errorContext = {
        type: "COMPONENT",
        errorMessage: err.message,
        stack: err.stack || null,
        vueInfo: info, // مثلاً 'render function' یا نام hook
        componentName,
        formState,
        requestPayload: null,
      };
      const payload = await buildPayload(errorContext);
      await sendErrorLog(payload);
    } catch {
      /* fail silently */
    }
    console.error(err);
  };

  // ——— 3️⃣ Promise rejectionهای مدیریت‌نشده ———
  window.addEventListener("unhandledrejection", async (event) => {
    try {
      const reason = event.reason;
      let type = "UNHANDLED_REJECTION";
      let errorMessage = reason?.message || String(reason);
      let stack = reason?.stack || null;
      let requestPayload = null;

      // تشخیص خطای Axios (اگر reason.isAxiosError باشد)
      if (reason?.isAxiosError) {
        type = "API_ERROR";
        errorMessage = reason.message;
        stack = reason.stack || null;
        // می‌توانیم جزئیات درخواست را بگیریم
        requestPayload = {
          url: reason.config?.url,
          method: reason.config?.method,
          data: reason.config?.data,
          params: reason.config?.params,
          status: reason.response?.status,
          responseData: reason.response?.data,
        };
      }

      const errorContext = {
        type,
        errorMessage,
        stack,
        vueInfo: null,
        componentName: null,
        formState: null,
        requestPayload,
      };
      const payload = await buildPayload(errorContext);
      await sendErrorLog(payload);
    } catch {
      /* fail silently */
    }
  });
});
