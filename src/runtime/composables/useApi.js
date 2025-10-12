// src/runtime/composables/useApi.js
import axios from "axios";
import { ref, unref, isProxy, toRaw } from "vue"; // [CHANGE#1] اضافه شد
import { useUserStore } from "#vorna-stores/user";
import { useRuntimeConfig, useNuxtApp, navigateTo, useCookie } from '#imports'


/** [CHANGE#2] helper: حذف ری‌اکتیویتی و قطع حلقه‌های ارجاعی */
function stripReactivity(value, seen = new WeakSet()) {
  const v = unref(value);
  if (v === null || v === undefined) return v;

  const t = typeof v;
  if (t !== "object") return v;

  if (seen.has(v)) return undefined; // جلوگیری از حلقه
  seen.add(v);

  const raw = isProxy(v) ? toRaw(v) : v;

  if (Array.isArray(raw)) {
    return raw.map((item) => stripReactivity(item, seen));
  }

  const out = {};
  for (const [k, val] of Object.entries(raw)) {
    out[k] = stripReactivity(val, seen);
  }
  return out;
}

/**
 * Composable درخواست‌های API با:
 * - Authorization خودکار از Pinia
 * - رفرش اکسس‌توکن روی 401/403 از /api/auth/refresh
 * - مدیریت pending/error/data و نوتیفیکیشن خطا
 */
export function useApi() {
  const pending = ref(false);
  const error = ref(null);
  const data = ref(null);

  const cfg = useRuntimeConfig().public.vornaPanel;
  const nuxtApp = useNuxtApp();
  const user = useUserStore();

  async function doFetch(endpoint, options = {}) {
    const {
      method = "get",
      data: body = null,
      showError = true,
      headers = {},
      baseUrl = null, // اگر لازم بود API دیگری صدا بزنی
      params = undefined,
      timeout = 30000,
    } = options;

    pending.value = true;
    error.value = null;
    data.value = null;

    // [CHANGE#3] پاک‌سازی ورودی‌ها از ref/proxy
    const cleanBody = stripReactivity(body);
    const cleanParams = stripReactivity(params);
    const cleanHeaders = stripReactivity(headers);

    const instance = axios.create({
      baseURL: baseUrl || cfg.baseUrl, // معمولاً آدرس بک‌اند اصلی
      withCredentials: false, // توکن را در هدر می‌فرستیم
      timeout,
    });
    let config = useRuntimeConfig().public.vornaPanel;
    let authHeaders = "";
    if (!user?.token) user.setToken(useCookie("token"));
    if (config.authType == "version2") {
      authHeaders = user?.token
        ? { Authorization: `Bearer ${user.token}` }
        : {};
    } else {
      authHeaders = user?.token ? { cookies: `${user.token}` } : {};
    }
    try {
      const res = await instance.request({
        url: endpoint,
        method,
        data: cleanBody, // [CHANGE#4] از نسخهٔ پاک‌شده استفاده کن
        params: cleanParams, // [CHANGE#4]
        headers: { ...cleanHeaders, ...authHeaders }, // [CHANGE#4]
      });

      data.value = res.data;
      return res.data;
    } catch (err) {
      const status = err?.response?.status;

      if (status === 401) {
        try {
          // رفرش به روت سروری که کوکی HttpOnly (sid) دارد
          const refreshRes = await axios.post("/api/auth/refresh", null, {
            withCredentials: true,
          });

          const { status: ok, accessToken } = refreshRes?.data || {};
          if (ok && accessToken) {
            if (typeof user.setToken === "function") user.setToken(accessToken);
            else if (typeof user.setUser === "function")
              user.setUser(accessToken);

            // تکرار درخواست اصلی با توکن تازه
            const retryRes = await instance.request({
              url: endpoint,
              method,
              data: cleanBody, // [CHANGE#4] دوباره هم از پاک‌شده‌ها
              params: cleanParams, // [CHANGE#4]
              headers: {
                ...cleanHeaders,
                Authorization: `Bearer ${accessToken}`,
              },
            });

            data.value = retryRes.data;
            return retryRes.data;
          }
        } catch {
          if (showError) {
            nuxtApp.$notifyDanger?.(
              "نشست شما منقضی شده است. دوباره وارد شوید."
            );
          }
          navigateTo("/login");
        }
      }

      error.value = err;
      if (showError) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "خطا در ارسال درخواست";
        nuxtApp.$notifyDanger?.(msg);
      }
      throw err;
    } finally {
      pending.value = false;
    }
  }

  return { pending, error, data, request: doFetch };
}
