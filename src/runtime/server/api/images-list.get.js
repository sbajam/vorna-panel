import { defineEventHandler } from 'h3'
import { promises as fs } from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  const metaPath = path.resolve('./public/uploads/images.json')
  try {
    const list = JSON.parse(await fs.readFile(metaPath, 'utf-8'))
    return { 
      status: true,
      data: {
        images: list
      }
    }
  } catch (error) {
    return { 
      status: false,
      message: 'خطا در بارگذاری تصاویر',
      data: {
        images: []
      }
    }
  }
})
