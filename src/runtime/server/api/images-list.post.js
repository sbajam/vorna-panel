import { promises as fs } from 'fs'
import path from 'path'
import { nanoid } from 'nanoid'
import sharp from 'sharp'
import { eventHandler, createError, readMultipartFormData } from 'h3'

export default eventHandler(async (event) => {
  try {
    // Log request headers for debugging
    console.log('Request headers:', event.node.req.headers)
    
    const parts = await readMultipartFormData(event)
    console.log('Parts received:', parts?.map(p => ({
      name: p.name,
      filename: p.filename,
      type: p.type,
      dataSize: p.data?.length
    })))

    if (!parts || parts.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No form data received'
      })
    }

    // Find the image part with more lenient checking
    const imagePart = parts.find(part => 
      (part.name === 'image' || part.filename) && 
      part.data?.length > 0
    )

    if (!imagePart) {
      throw createError({
        statusCode: 400,
        message: `فایل image ارسال نشده. فیلدهای دریافتی: ${parts.map(p => p.name).join(', ')}`
      })
    }

    // Create upload directory
    const uploadDir = path.resolve('./public/uploads')
    await fs.mkdir(uploadDir, { recursive: true })

    // Process image directly from buffer
    const id = nanoid()
    const outName = `${id}.webp`
    const outPath = path.join(uploadDir, outName)

    await sharp(imagePart.data)
      .resize({ width: 1920 })
      .webp({ quality: 80 })
      .toFile(outPath)

    // Get title from form data
    const titlePart = parts.find(part => part.name === 'title')
    const title = titlePart ? titlePart.data.toString() : ''

    // Save metadata
    const metaPath = path.join(uploadDir, 'images.json')
    let list = []
    try {
      list = JSON.parse(await fs.readFile(metaPath, 'utf-8'))
    } catch {}

    list.push({
      id,
      title,
      url: `/uploads/${outName}`,
      createdAt: Date.now()
    })

    await fs.writeFile(metaPath, JSON.stringify(list, null, 2))

    return { success: true, message: 'تصویر با موفقیت بارگذاری شد' }
  } catch (error) {
    console.error('Upload error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'خطا در آپلود تصویر'
    })
  }
})
