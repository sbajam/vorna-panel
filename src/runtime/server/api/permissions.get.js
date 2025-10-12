import { defineEventHandler } from 'h3'
import { prisma } from '../utils/db'

export default defineEventHandler(async () => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: { module: 'asc' }
    })

    const safePermissions = permissions.map(p => ({
      ...p,
      id: p.id.toString() // اگر id از نوع BigInt هست
    }))

    return { status: true, data: safePermissions }
  } catch (e) {
    return { status: false, message: e.message }
  }
})
