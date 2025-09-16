// plugins/vorna-badges.ts (client)
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { ref } from 'vue'
import { defineVornaBadge } from '../../src/runtime/composables/badge'

export default defineNuxtPlugin(() => {
    // --- 1) سبد خرید: هر 10 ثانیه یک عدد رندومی ---
    const cartUnchecked = ref<number | null>(null)
    defineVornaBadge('cart:unchecked', cartUnchecked)

    const tickCart = () => {
        cartUnchecked.value = Math.floor(Math.random() * 10) + 1 // 1..10
    }
    tickCart()
    setInterval(tickCart, 10_000)

    // --- 2) سوالات: هر 2 دقیقه از API بخوان و answered === false ها را بشمارد ---
    const qPending = ref<number | null>(null)
    defineVornaBadge('questions:pending', qPending)

    const { public: pub } = useRuntimeConfig()
    // اگر baseUrl در کانفیگت آمده، استفاده کن؛ وگرنه از پیش‌فرض
    const base = (pub?.vornaPanel?.baseUrl ?? 'https://api.vendow.ir/admins').replace(/\/$/, '')
    const url = `${base}/question`

    const fetchQuestions = async () => {
        let { request } = useApi()
        try {
            let data = await request(url)
            //   const data: any = await $fetch(url, {
            //     method: 'GET',
            //     headers: { Authorization: `Bearer ${token}` } // اگر لازم داری
            //   })
            const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : [])
            qPending.value = list.filter((x: any) => x?.answered === false).length
        } catch (e) {
            qPending.value = null // خطا → Badge مخفی می‌ماند
            // console.error('[questions:pending] fetch error', e)
        }
    }

    fetchQuestions()
    setInterval(fetchQuestions, 120_000)
})
