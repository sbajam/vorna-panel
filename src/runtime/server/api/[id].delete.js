import { promises as fs } from 'fs'
import path from 'path'

export default async (req, res) => {
  const { id } = req.params
  const uploadDir = path.resolve('./public/uploads')
  const metaPath = path.join(uploadDir, 'images.json')

  try {
    let list = JSON.parse(await fs.readFile(metaPath, 'utf-8'))
    const idx = list.findIndex(img => img.id === id)
    if (idx === -1) return res.status(404).json({ error: 'یافت نشد' })

    // حذف فایل فیزیکی
    const filename = list[idx].url.split('/').pop()
    await fs.unlink(path.join(uploadDir, filename))

    // حذف از متادیتا
    list.splice(idx, 1)
    await fs.writeFile(metaPath, JSON.stringify(list, null, 2))

    res.status(200).json({ success: true })
  } catch {
    res.status(500).json({ error: 'خطا در حذف تصویر' })
  }
}
