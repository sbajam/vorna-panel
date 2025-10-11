// src/runtime/plugins/axios-logger.client.ts
import { defineNuxtPlugin } from "#imports";
import axios from "axios";             // instance پیش‌فرض axios
import { UAParser } from "ua-parser-js";
import html2canvas from "html2canvas";
import { useUserStore } from "~vorna-stores/user"; 

export default defineNuxtPlugin((nuxtApp) => {
  const parser = new UAParser();
  const userStore = useUserStore();

  // تابع کمکی: گرفتن اسکرین‌شات صفحه و برگرداندن Base64// به‌عنوان مثال در src/runtime/plugins/axios-logger.client.ts یا
// در پلاگینِ error-logger-with-details.client.ts

// تابع کمکی: گرفتن اسکرین‌شات صفحه و برگرداندن Base64 (JPEG با کیفیت معقول)
async function captureScreenshot(): Promise<string | null> {
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


  // تابع کمکی: ارسال payload به سرور لاگ خطا
  async function sendErrorLog(payload: any) {
    try {
      await fetch("/api/error-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error("[AxiosLogger] send log failed:", e);
    }
  }

  // تابع ساخت payload مخصوص خطای API
  async function buildApiErrorPayload(errorContext: any) {
    const username = userStore.username || "guest";
    const uaResult = parser.setUA(navigator.userAgent).getResult();
    const screenshot = await captureScreenshot();
    // مسیری که در نوت اپ فعلی هستیم (برای داینامیک بودن از window استفاده می‌کنیم)
    const currentRoute = window.location.pathname + window.location.search;
    // در این پلاگین، lastRoute را نمی‌گیریم؛ در صورت نیاز می‌توانید از router و afterEachِ پلاگین دیگر استخراج کنید
    const lastRoute = null;

    const baseInfo: any = {
      username,
      url: currentRoute,
      lastRoute,
      user_agent: navigator.userAgent,
      ip: null as string | null,
      timestamp: new Date().toISOString(),
      device: uaResult.device.type || "Desktop",
      os: uaResult.os.name + (uaResult.os.version ? " " + uaResult.os.version : ""),
      browser: uaResult.browser.name + (uaResult.browser.version ? " " + uaResult.browser.version : ""),
      location: null,
      screenshot,
    };

    // استخراج IP اگر لازم باشد (معمولاً سمت کلاینت نداریم، ولی اگر هدر بگیرید)
    // این قسمت شرطی است و می‌توانید حذف کنید
    try {
      const xff = (await nuxtApp.$h3.getRequestHeader("x-forwarded-for")) as string | string[] | undefined;
      if (xff) {
        baseInfo.ip = Array.isArray(xff) ? xff[0] : xff;
      } else {
        // @ts-ignore
        baseInfo.ip = nuxtApp.ssrContext?.event?.node?.req?.socket?.remoteAddress ?? null;
      }
    } catch {
      baseInfo.ip = null;
    }

    // جزئیات خطای API (payloadی که به سرور فرستاده یا پاسخ دریافتی)
    const details: Record<string, any> = {
      clientTimestamp: new Date().toISOString(),
      viewport: { width: window.innerWidth, height: window.innerHeight },
      language: navigator.language,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isOnline: navigator.onLine,
    };
    Object.assign(details, errorContext);

    return {
      ...baseInfo,
      type: "API_ERROR", // یا اگر enum دیگری دارید، مقدار مناسب را بنویسید
      details,
    };
  }

  // ——— نصب interceptor روی default axios ———

  // ۱) request interceptor: اگر نیاز دارید هدرهای مشترکی اضافه کنید
  axios.interceptors.request.use(
    (req) => {
      // مثال: اضافه کردن توکن در هر درخواست
      const token = nuxtApp.$cookies?.get("token");
      if (token) {
        req.headers = req.headers || {};
        req.headers.Authorization = `Bearer ${token}`;
      }
      return req;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // ۲) response interceptor (موفقیت ۲xx ولی status:false در بدنه)
  axios.interceptors.response.use(
    async (response) => {
      if (response.data && response.data.status === false) {
        // اگر API خودتان به جای خطای ۴xx، { status: false, message: … } برمی‌گرداند
        const errorContext = {
          requestPayload: {
            url: response.config.url,
            method: response.config.method,
            data: response.config.data,
            params: response.config.params,
          },
          responsePayload: response.data,
          status: response.status,
          errorMessage: response.data.message || "API returned status false",
          stack: null,
        };
        const payload = await buildApiErrorPayload(errorContext);
        await sendErrorLog(payload);
      }
      return response;
    },
    async (error) => {
      // اینجا یا خطای شبکه است یا کد ۴xx/۵xx
      try {
        const response = error.response;
        const errorContext = {
          requestPayload: response?.config
            ? {
                url: response.config.url,
                method: response.config.method,
                data: response.config.data,
                params: response.config.params,
              }
            : null,
          responsePayload: response?.data || null,
          status: response?.status || null,
          errorMessage: error.message,
          stack: error.stack || null,
        };
        const payload = await buildApiErrorPayload(errorContext);
        await sendErrorLog(payload);
      } catch (e) {
        console.error("[AxiosLogger] error in response interceptor:", e);
      }
      return Promise.reject(error);
    }
  );
});