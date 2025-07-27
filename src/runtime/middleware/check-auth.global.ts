import { defineNuxtRouteMiddleware, navigateTo, useNuxtApp, useRuntimeConfig } from '#imports'
import { useUserStore } from '../stores/user'
import { useApi } from '../composables/useApi'

export default defineNuxtRouteMiddleware(async (to) => {
  const userStore = useUserStore()
  const { $notify } = useNuxtApp()
  const config = useRuntimeConfig().public.vornaPanel
  const { request } = useApi()
  console.log('[✅ Middleware check-auth.global.ts executed]')

  // ۱. چک کردن مسیرهای مهمان
  const guestRoutes = config.guestRoutes || ['/login', '/403', '/404']
  if (guestRoutes.some(route => to.path.startsWith(route))) {
    return // اجازه دسترسی به مسیرهای مهمان
  }

  // ۲. چک کردن وضعیت لاگین
  let res: any
  try {
    res = await request('/is_login', {
      method: 'get',
      headers: { 'Cache-Control': 'no-cache' }
    })
  } catch {
    res = { status: false, message: 'خطا در ارتباط با سرور' }
  }

  // اگر لاگین نبود، به صفحه لاگین هدایت می‌شود
  if (!res?.status) {
    $notify(res?.message || 'لطفاً ابتدا لاگین کنید.', 'error')
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  // ۳. چک کردن نقش superAdmin
  if (userStore.roles.includes('superadmin')) {
    return // اگر superAdmin باشد، نیازی به چک کردن دسترسی‌ها نیست
  }

  // ۴. به‌روزرسانی اطلاعات دسترسی‌ها
  try {
    const permRes = await request('/api/user-permissions')
    if (permRes.status) {
      userStore.setPermissions(permRes.data)
    }
  } catch (error) {
    console.error('خطا در دریافت دسترسی‌ها:', error)
  }

  // ۵. چک کردن دسترسی به مسیر
  if (!userStore.hasRoutePermission(to.path)) {
    $notify('شما دسترسی لازم به این صفحه را ندارید', 'error')
    return navigateTo('/')
  }
})


