// server/api/auth/login.post.ts
import { defineEventHandler, readBody, setCookie } from 'h3'
import { nanoid } from 'nanoid'

// ذخیره ساده (بهتره بعداً با Redis جایگزینش کنی)
const sessions = globalThis.__SESS__ ??= new Map<string, { refreshToken: string }>()

export default defineEventHandler(async (event) => {
    const { username, password, fingerprintHash } = await readBody(event)
    // TODO:baseURL 
    // تماس با بک‌اند خودت برای لاگین
    const auth = await $fetch<{ status: boolean; token: string; refreshToken: string; message?: string,companyFullName: any }>(
        `${useRuntimeConfig().public.vornaPanel.baseUrl}/login`,
        { method: 'POST', body: { userName: username, password, fingerprintHash } }
    )
    if (!auth?.status) {
        event.node.res.statusCode = 200
        return { status: false, message: auth?.message || 'ورود ناموفق' }
    }

    // ساخت سشن و ذخیره رفرش فقط در سرور
    const sid = nanoid(32)
    sessions.set(sid, { refreshToken: auth.refreshToken })
    // ست کردن sid در کوکی HttpOnly
    setCookie(event, 'sid', sid, {
        httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30,
    })

    // فقط اکسس‌توکن رو به کلاینت بده
    return { status: true, accessToken: auth.token, message: auth.message, companyFullName: auth.companyFullName, }
})
