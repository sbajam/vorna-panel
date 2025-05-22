import { promises as fs } from 'fs'
import path from 'path'
import { eventHandler, getRouterParam } from 'h3'

export default eventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const uploadDir = path.resolve('./public/uploads')
  const metaPath = path.join(uploadDir, 'images.json')
  
  try {
    const list = JSON.parse(await fs.readFile(metaPath, 'utf-8'))
    const idx = list.findIndex(img => img.id === id)
    if (idx === -1) {
      return { error: 'یافت نشد', status: 404 }
    }
    
    const filename = list[idx].url.split('/').pop()
    await fs.unlink(path.join(uploadDir, filename))
    list.splice(idx, 1)
    await fs.writeFile(metaPath, JSON.stringify(list, null, 2))
    return { success: true }
  } catch {
    return { error: 'خطا در حذف تصویر', status: 500 }
  }
})
