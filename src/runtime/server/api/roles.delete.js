import { defineEventHandler } from 'h3'
import { prisma } from '../utils/db'

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params.id)
  if (!id) {
    return { status: false, message: 'شناسه معتبر نیست' }
  }

  try {
    // حذف ارتباط‌های جدول واسط
    await prisma.role.update({
      where: { id },
      data: {
        permissions: {
          set: [], // پاک کردن تمام روابط
        },
      },
    })

    // حذف خود نقش
    await prisma.role.delete({
      where: { id },
    })

    return { status: true, message: 'نقش حذف شد' }
  } catch (e) {
    return { status: false, message: e.message }
  }
})
