import { defineNuxtPlugin } from '#app'
import  DatePicker  from '@alireza-ab/vue3-persian-datepicker'

export default defineNuxtPlugin((nuxtApp) => {
  // رجیستر کردن کامپوننت به صورت سراسری
  nuxtApp.vueApp.component('DatePicker', DatePicker)
})
