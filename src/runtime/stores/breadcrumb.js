// stores/breadcrumb.js
import { defineStore } from 'pinia'

export const useBreadcrumbStore = defineStore('breadcrumb', {
  state: () => ({
    /** @type {{ title: string; path: string }[]} */
    trail: []
  }),

  actions: {
    reset() {
      this.trail = []
    },

    /**
     * عنوان و مسیر فعلی را به تریل اضافه می‌کند.
     * - اگر مسیر جدید قبلاً در تریل نبوده => به انتها اضافه می‌شود.
     * - اگر مسیر جدید آخرین عنصر تریل باشد => هیچ تغییری نمی‌دهد.
     * - اگر مسیر جدید در میانه‌ی تریل باشد => تریل تا آن ایتم کوتاه می‌شود.
     * - اگر فقط یک عنصر در تریل باشد و همان مسیر باشد => هیچ تغییری نمی‌دهد.
     */
    push(title, path) {
      const idx = this.trail.findIndex(item => item.path === path)

      // ۱) اگر مسیر جدید قبلاً اضافه نشده بود
      if (idx === -1) {
        this.trail.push({ title, path })
        return
      }

      // ۲) اگر مسیر جدید آخرین عنصر باشد یا فقط یک عنصر در تریل باشد
      if (idx === this.trail.length - 1 || this.trail.length === 1) {
        return
      }

      // ۳) مسیر قبلاً وجود داشت و میانه‌ی تریل بود: کوتاهش می‌کنیم
      //    (حذف می‌کنیم همه‌ی ایتم‌های بعد از آن)
      this.trail.splice(idx + 1)
    }
  }
})
