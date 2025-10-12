<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeConfig, useRoute, definePageMeta } from '#imports'
import { useUserStore } from '#vorna-stores/user'


const config    = useRuntimeConfig().public.vornaPanel
const userStore = useUserStore()

// فهرست آیتم‌های قابل دسترسی
const accessible = computed(() => {
  // ابتدا همه آیتم‌ها رو بردار
  return config.menuItems
    .flatMap(section => section.items)
    .filter(item => {
      // اگر superAdmin هست، همه چی را می‌تونه ببینه
      if (config.superAdmins?.includes(userStore.username || '')) {
        return true
      }
      // اگر publicAdmin باشه، لاگین برای دیدن کافی‌ست
      if (item.publicAdmin) {
        return !!userStore.token
      }
      // اگر برای نقش(ها) تعریف شده
      if (item.roles?.length) {
        return item.roles.some(r => userStore.roles.includes(r))
      }
      // در غیر این صورت پیش‌فرض نمایش‌ده
      return true
    })
})
</script>

<template>
  <section class="p-6">
    <h1 class="text-2xl font-bold mb-4">
      دسترسی‌های کاربر: <span class="text-primary-100">{{ userStore.username }}</span>
    </h1>

    <ul class="list-disc pl-6 space-y-2">
      <li v-for="item in accessible" :key="item.path">
        <strong>{{ item.label }}</strong>
        <small class="text-gray-500">(مسیر: <code>{{ item.path }}</code>)</small>
      </li>
    </ul>

    <div v-if="!accessible.length" class="mt-4 text-gray-500">
      هیچ دسترسی‌ای برای نمایش وجود ندارد.
    </div>
  </section>
</template>

<style scoped>
code {
  background: #f4f4f4;
  padding: 2px 4px;
  border-radius: 4px;
}
</style>
