// server/api/roles.get.js
import { prisma } from '../utils/db'
import { safeJson } from '../utils/json'

export default defineEventHandler(async () => {
  const roles = await prisma.role.findMany({
    include: { permissions: true },
    orderBy: { name: 'asc' },
  })
  return { status: true, data: safeJson(roles) }
})
