import { readBody } from 'h3'
import { prisma } from '../utils/db'

// تبدیل BigInt به string به صورت بازگشتی
function fixBigInt(obj) {
  if (Array.isArray(obj)) {
    return obj.map(fixBigInt)
  } else if (obj && typeof obj === 'object') {
    const newObj = {}
    for (const key in obj) {
      const value = obj[key]
      newObj[key] = typeof value === 'bigint' ? value.toString() : fixBigInt(value)
    }
    return newObj
  }
  return obj
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!Array.isArray(body)) {
    return { status: false, message: 'Invalid data format. Must be array.' }
  }

  try {
    const incomingKeys = body
      .filter(perm => perm.key && perm.module && perm.action)
      .map(perm => perm.key)

    const existing = await prisma.permission.findMany({ select: { key: true } })
    const existingKeys = existing.map(p => p.key)

    const keysToDelete = existingKeys.filter(k => !incomingKeys.includes(k))

    if (keysToDelete.length) {
      await prisma.permission.deleteMany({
        where: { key: { in: keysToDelete } },
      })
    }

    const result = await Promise.all(
      body.map(async (perm) => {
        if (!perm.key || !perm.module || !perm.action) return null
        return await prisma.permission.upsert({
          where: { key: perm.key },
          update: {},
          create: perm,
        })
      })
    )

    return {
      status: true,
      message: 'Permissions saved and cleaned.',
      data: fixBigInt(result.filter(Boolean)),
      deleted: keysToDelete.length,
    }
  } catch (e) {
    return { status: false, message: e.message }
  }
})
