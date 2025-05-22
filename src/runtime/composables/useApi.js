// src/runtime/composables/useApi.js
import axios from 'axios'
import { ref } from 'vue'
import { useRuntimeConfig, useCookie, useNuxtApp } from '#imports'

/**
 * Composable برای ارسال درخواست‌های Axios با baseUrl و token اتوماتیک،
 * و مدیریت spinner و error.
 */
export function useApi() {
  const pending = ref(false)
  const error   = ref(null)
  const data    = ref(null)
  const config     = useRuntimeConfig().public.vornaPanel
  const nuxtApp     = useNuxtApp()

  async function request(endpoint, options = {}) {
    const {
      method    = 'get',
      data: body = null,
      showError = true,
      headers   = {}
    } = options

    pending.value = true
    error.value   = null

    try {
      const response = await axios({
        baseURL: config.baseUrl,
        url: endpoint,
        method,
        data: body,
        headers: {
          ...headers,
          'cookie': useCookie('token').value,
        }
      })
      data.value = response.data
      return response.data
    } catch (err) {
      error.value = err
      if (showError) {
        nuxtApp.$notifyDanger(err?.message || 'خطا در ارسال درخواست')
      }
      throw err
    } finally {
      pending.value = false
    }
  }

  return { pending, error, data, request }
}
