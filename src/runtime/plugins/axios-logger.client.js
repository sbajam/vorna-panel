// src/runtime/plugins/axios-logger.client.js
import { defineNuxtPlugin } from "#imports";
import axios from "axios";
import { UAParser } from "ua-parser-js";
import { useUserStore } from "../stores/user";

export default defineNuxtPlugin((nuxtApp) => {
  const parser = new UAParser();
  const userStore = useUserStore();

  // === interceptor برای پاسخ موفق ===
  axios.interceptors.response.use(
    (response) => {
      try {
        const username = userStore.username || "guest";
        const uaResult = parser.setUA(navigator.userAgent).getResult();

        const logPayload = {
          username,
          type: "API_REQUEST",
          url: response.config.url,
          method: (response.config.method || "GET").toUpperCase(),
          status: response.status,
          params: response.config.params || response.config.data || {},
          responseData: response.data,        // ← اضافه شد
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
      } catch { /* fail silent */ }
      return response;
    },
    (error) => {
      try {
        const response = error.response || {};
        const username = userStore.username || "guest";
        const uaResult = parser.setUA(navigator.userAgent).getResult();

        const logPayload = {
          username,
          type: "API_REQUEST",
          url: response.config?.url || error.config?.url || "",
          method: (response.config?.method || error.config?.method || "GET").toUpperCase(),
          status: response.status || 0,
          params: response.config?.params || response.config?.data || {},
          responseData: response.data || error.message, // ← اگر خطا داده، لااقل پیام خطا را بفرست
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
      } catch { /* fail silent */ }
      return Promise.reject(error);
    }
  );
});
