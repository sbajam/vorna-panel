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
          cookie: useCookie("token").value,
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
