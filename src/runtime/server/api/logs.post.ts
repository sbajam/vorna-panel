// server/api/logs.post.ts
import { defineEventHandler, readBody, getRequestHeader } from 'h3'
import { prisma } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as {
    username?: string
    type: string
    url: string
    method?: string
    status?: number
    params?: any
    responseData?: any
    userAgent: string
    device?: string
    os?: string
    browser?: string
    location?: { country?: string; city?: string }
  }

  let ip: string
  const xff = getRequestHeader(event, 'x-forwarded-for')
  if (xff) {
    ip = Array.isArray(xff) ? xff[0] : xff
  } else {
    // @ts-ignore
    ip = event.node.req.socket.remoteAddress || ''
  }

  try {
    await prisma.userLog.create({
      data: {
        username: body.username || 'guest',
        type: body.type,
        url: body.url,
        method: body.method || null,
        status: body.status || null,
        params: body.params || {},
        responseData: body.responseData || null, // ← اینجا
        user_agent: body.userAgent,
        ip,
        device: body.device || null,
        os: body.os || null,
        browser: body.browser || null,
        location: body.location || null,
      },
    })
    return { success: true }
  } catch (e) {
    console.error('[logs.post] Failed to save log:', e)
    return { success: false }
  }
})
