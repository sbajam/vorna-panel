// src/runtime/server/api/_inject-rootdir.js
import { eventHandler } from 'h3'

export default eventHandler((event) => {
  // اینجا rootDir پروژه‌ی میزبان رو می‌ریزیم داخل context
  event.context.rootDir = event.context.rootDir || process.cwd()
})
