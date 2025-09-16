// src/runtime/plugins/badge-registry.ts
import { defineNuxtPlugin } from '#app'
import { BadgeRegistryKey, makeRegistry, type Registry } from '../composables/badge'

export default defineNuxtPlugin((nuxtApp) => {
  const reg: Registry = makeRegistry()
  nuxtApp.vueApp.provide(BadgeRegistryKey, reg) // برای inject داخل کامپوننت‌ها
  nuxtApp.provide('badgeRegistry', reg)        // برای استفاده در پلاگین‌ها: nuxtApp.$badgeRegistry
})
