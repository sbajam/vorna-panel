import { promises as fs } from 'fs'
import path from 'path'
import { eventHandler } from 'h3'

export default eventHandler(async () => {
  const uploadDir = path.resolve('./public/uploads')
  const metaPath = path.join(uploadDir, 'images.json')
  
  try {
    const content = await fs.readFile(metaPath, 'utf-8')
    const images = JSON.parse(content)
    return { images }
  } catch {
    return { images: [] }
  }
})
