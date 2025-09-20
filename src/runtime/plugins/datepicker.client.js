import { defineNuxtPlugin } from '#app'
import  DatePicker  from 'vue3-persian-datetime-picker'

export default defineNuxtPlugin((nuxtApp) => {
  // رجیستر کردن کامپوننت به صورت سراسری
  nuxtApp.vueApp.component('DatePicker', DatePicker)
})
