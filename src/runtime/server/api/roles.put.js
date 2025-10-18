import { defineEventHandler, readBody } from 'h3'
import { prisma } from '#vorna-utils/db'

// optional helper
function safeJson(obj) {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params.id)
  const body = await readBody(event)
  const { name, permissions } = body

  if (!name || !Array.isArray(permissions)) {
    return { status: false, message: 'Invalid role data' }
  }

  try {
    // lookup permission ids by keys
    const existingPermissions = await prisma.permission.findMany({
      where: { key: { in: permissions } },
      select: { id: true },
    })

    const role = await prisma.role.update({
      where: { id },
      data: {
        name,
        permissions: {
          set: existingPermissions.map(p => ({ id: p.id }))
        }
      },
      include: { permissions: true }
    })

    return { status: true, data: safeJson(role) }
  } catch (e) {
    return { status: false, message: e.message }
  }
})
