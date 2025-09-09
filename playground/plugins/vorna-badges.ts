import { defineNuxtPlugin } from '#app'
import { defineVornaBadge } from '../../src/runtime/composables/badge'
import { ref, computed } from 'vue'

export default defineNuxtPlugin(() => {
    // badge برای سبد خرید
    const cartUnchecked = ref(5)
    defineVornaBadge('cart:unchecked', cartUnchecked)

    // badge برای پاسخگویی مشتریان - مقدار ثابت 3
    const customerQuestions = computed(() => 3)
    defineVornaBadge('questions:pending', customerQuestions)

    // به‌روزرسانی مقدار badge سبد خرید هر 30 ثانیه
    if (process.client) {
        setInterval(() => {
            cartUnchecked.value = Math.floor(Math.random() * 10)
        }, 30000)
    }
})
