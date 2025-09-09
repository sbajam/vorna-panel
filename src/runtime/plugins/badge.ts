import { defineNuxtPlugin } from "#imports";
import { provideBadgeRegistry } from '../composables/badge'

export default defineNuxtPlugin(() => {
  provideBadgeRegistry()
})
