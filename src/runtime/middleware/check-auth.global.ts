import { defineNuxtRouteMiddleware, navigateTo, useNuxtApp, useRuntimeConfig } from '#imports'
import { useUserStore } from '../stores/user'
import { useApi } from '../composables/useApi'
import { showError } from 'nuxt/app'

export default defineNuxtRouteMiddleware(async (to) => {
  const userStore = useUserStore()
  const { $notify, $notifyDanger } = useNuxtApp()
  const config = useRuntimeConfig().public.vornaPanel
  const { request } = useApi()

  // ✅ لاگ اجرایی
  console.log('[✅ Middleware check-auth.global.ts executed]', process.server ? '[SSR]' : '[Client]')
  if (['/login', '/403', '/404'].includes(to.path)) return true
  // ۱. مسیرهای مهمان
  const guestRoutes = config.guestRoutes || ['/login', '/403', '/404']
  if (guestRoutes.some(route => to.path.startsWith(route))) return

  // ۲. بررسی وضعیت لاگین
  let res: any
  try {
    res = await request(`/${config.isLoginRoute}`, {
      method: 'get',
      headers: { 'Cache-Control': 'no-cache' }
    })
  } catch {
    res = { status: false, message: 'خطا در ارتباط با سرور' }
  }

  if (!res?.status) {
    userStore.clearUser()
    $notify(res?.message || 'لطفاً ابتدا لاگین کنید.', 'error')
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  // ۳. تنظیم نقش کاربر
  const userRole = res?.roles || 'superAdmin' //defautl Role
  userStore.setUser(userStore.token, userRole)

  // ۴. بررسی نقش سوپرادمین
  const isSuperAdmin = config.superAdmins?.includes(userRole) || userStore.roles.includes('superAdmin')
  if (isSuperAdmin) return

  // ۵. دریافت دسترسی‌ها از سرور
  try {
    const permissionsRes = await request(`/api/user-permissions?role=${userRole}`, { baseUrl: 'http://localhost:3000' })
    if (permissionsRes.status) {
      userStore.setPermissions(permissionsRes.data)
    } else {
      // throw new Error('دسترسی‌ها دریافت نشد.')
    }
  } catch (error) {
    $notifyDanger('خطا در دریافت دسترسی‌ها')
  }

  try {
    const hasAccess = userStore.hasRoutePermission(to.path)

    if (!hasAccess) {

      return navigateTo('/403')
    }
    else { return true }
  } catch (e) {
  }
})
