import { defineEventHandler } from 'h3'
import { prisma } from '../utils/db'

export default defineEventHandler(async (event) => {
  const { role } = event.context // این از میدلور قبلی ست شده

  try {
    const userRole = await prisma.role.findUnique({
      where: { name: role },
      include: {
        permissions: {
          select: { key: true }
        }
      }
    })

    return {
      status: true,
      data: userRole ? userRole.permissions.map(p => p.key) : []
    }
  } catch (error) {
    console.error('Error fetching user permissions:', error)
    return {
      status: false,
      message: 'خطا در دریافت دسترسی‌های کاربر'
    }
  }
})
