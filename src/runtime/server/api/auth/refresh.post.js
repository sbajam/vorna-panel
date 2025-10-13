// server/api/auth/refresh.post.ts
import { defineEventHandler, getCookie } from 'h3'
import {useRuntimeConfig} from '#imports'

// همون storage از فایل قبلی
const sessions = globalThis.__SESS__ ??= new Map()

export default defineEventHandler(async (event) => {
    const sid = getCookie(event, 'sid')
    if (!sid || !sessions.has(sid)) {
        event.node.res.statusCode = 401
        return { status: false, message: 'سشن یافت نشد' }
    }

    const { refreshToken } = sessions.get(sid)

    // تماس با بک‌اند برای گرفتن اکسس جدید (و شاید رفرش جدید)
    const res = await $fetch(
        `${useRuntimeConfig().public.vornaPanel.baseUrl}/company/refresh`,
        { method: 'POST', body: { refreshToken } }
    )

    if (!res?.status || !res.token) {
        // اگر نامعتبر بود، سشن رو پاک کن تا کاربر دوباره لاگین کنه
        sessions.delete(sid)
        event.node.res.statusCode = 401
        return { status: false, message: 'رفرش نامعتبر' }
    }

    // اگر بک‌اند رفرش جدید داد، جایگزین کن (Rotation)
    if (res.refreshToken) {
        sessions.set(sid, { refreshToken: res.refreshToken })
    }

    // اکسس جدید را به کلاینت بده
    return { status: true, accessToken: res.token }
})
