// src/runtime/composables/useApi.js
import axios from "axios";
import { ref } from "vue";
import { useRuntimeConfig, useCookie, useNuxtApp } from "#imports";

/**
 * Composable برای ارسال درخواست‌های Axios با baseUrl و token اتوماتیک،
 * و مدیریت spinner و error.
 */
export function useApi() {
  const pending = ref(false);
  const error = ref(null);
  const data = ref(null);
  const config = useRuntimeConfig().public.vornaPanel;
  const nuxtApp = useNuxtApp();

  async function request(endpoint, options = {}) {
    const {
      method = "get",
      data: body = null,
      showError = true,
      headers = {},
      baseUrl = null,
    } = options;

    // Reset state at the start of each request
    pending.value = true;
    error.value = null;
    data.value = null;

    try {
      console.log('Request started, pending:', pending.value);
      const response = await axios({
        baseURL: baseUrl || config.baseUrl,
        url: endpoint,
        method,
        data: body,
        headers: {
          ...headers,
          cookies: useCookie("token").value,
        },
      });
      data.value = response.data;
      console.log('Request successful');
      return response.data;
    } catch (err) {
      console.error('Request failed:', err);
      error.value = err;
      if (showError) {
        nuxtApp.$notifyDanger(err?.response?.data?.message || err?.message || "خطا در ارسال درخواست");
      }
      throw err;
    } finally {
      pending.value = false;
      console.log('Request finished, pending:', pending.value);
    }
  }

  return { pending, error, data, request };
}
/*
// src/runtime/composables/useApi.js
import axios from "axios";
import { ref } from "vue";
import { useRuntimeConfig, useNuxtApp } from "#imports";
import UAParser from "ua-parser-js";
import { useUserStore } from "@/stores/user"; // مسیر را با توجه به ساختار پروژه‌تان اصلاح کنید


//  * Composable برای ارسال درخواست‌های Axios با baseUrl و token اتوماتیک،
//  * مدیریت pending/error/data،
//  * و ارسال لاگِ API_REQUEST به /api/logs با استفاده از Pinia برای username
 
export function useApi() {
  const pending = ref(false);
  const error = ref(null);
  const data = ref(null);
  const config = useRuntimeConfig().public.vornaPanel;
  const nuxtApp = useNuxtApp();

  const parser = new UAParser();
  const userStore = useUserStore(); // گرفتن instance از Store

  async function request(endpoint, options = {}) {
    const {
      method = "get",
      data: body = null,
      showError = true,
      headers = {},
      baseUrl = null,
    } = options;

    pending.value = true;
    error.value = null;
    data.value = null;

    try {
      // === ۱. ارسال درخواست اصلی ===
      const response = await axios({
        baseURL: baseUrl || config.baseUrl,
        url: endpoint,
        method,
        data: body,
        headers: {
          ...headers,
          // اگر روی Cookie توکن ذخیره می‌کنید:
          cookie: useNuxtApp().$cookies.get("token") || "",
        },
      });

      data.value = response.data;

      // === ۲. ارسال لاگ موفقیت (API_REQUEST) ===
      try {
        const username = userStore.username || "guest";
        const uaResult = parser.setUA(navigator.userAgent).getResult();

        const logPayload = {
          username,
          type: "API_REQUEST", // یا اگر enum دارید: LogType.API_REQUEST
          url: endpoint,
          method: method.toUpperCase(),
          status: response.status,
          params: body || {},
          userAgent: navigator.userAgent,
          device: uaResult.device.type || "Desktop",
          os:
            uaResult.os.name +
            (uaResult.os.version ? " " + uaResult.os.version : ""),
          browser:
            uaResult.browser.name +
            (uaResult.browser.version ? " " + uaResult.browser.version : ""),
          location: null,
        };

        // fire-and-forget
        fetch("/api/logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(logPayload),
        }).catch(() => {});
      } catch (logErr) {
        console.warn("Failed to send log:", logErr);
      }

      return response.data;
    } catch (err) {
      // === ۳. ارسال لاگ خطا (اختیاری) ===
      try {
        const username = userStore.username || "guest";
        const uaResult = parser.setUA(navigator.userAgent).getResult();

        const logPayload = {
          username,
          type: "API_REQUEST", // یا "API_ERROR" اگر enum تعریف کردید
          url: endpoint,
          method: method.toUpperCase(),
          status: err?.response?.status || 0,
          params: body || {},
          userAgent: navigator.userAgent,
          device: uaResult.device.type || "Desktop",
          os:
            uaResult.os.name +
            (uaResult.os.version ? " " + uaResult.os.version : ""),
          browser:
            uaResult.browser.name +
            (uaResult.browser.version ? " " + uaResult.browser.version : ""),
          location: null,
        };

        fetch("/api/logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(logPayload),
        }).catch(() => {});
      } catch {
        // fail silent
      }

      console.error("Request failed:", err);
      error.value = err;
      if (showError) {
        nuxtApp.$notifyDanger(
          err?.response?.data?.message || err?.message || "خطا در ارسال درخواست"
        );
      }
      throw err;
    } finally {
      pending.value = false;
    }
  }

  return { pending, error, data, request };
}
*/