// plugins/auto-animate.js
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import { defineNuxtPlugin } from "#imports";
export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(autoAnimatePlugin)
})
