// server/api/roles.get.js
import { defineEventHandler } from 'h3'
import { prisma } from '#vorna-utils/db'
import { safeJson } from '#vorna-utils/json'

export default defineEventHandler(async () => {
  const roles = await prisma.role.findMany({
    include: { permissions: true },
    orderBy: { name: 'asc' },
  })
  return { status: true, data: safeJson(roles) }
})
