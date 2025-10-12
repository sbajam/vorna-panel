// src/runtime/plugins/expose-composables.js
import { defineNuxtPlugin } from '#imports'
import { useApi } from '../composables/useApi'

export default defineNuxtPlugin(() => {
  // در دسترس کردن سراسری، فقط برای فیکس سریع
  globalThis.useApi = useApi
})
