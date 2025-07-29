<!-- components/widgets/StatCard.vue -->
<template>
  <div>
    <div class="text-2xl font-bold">{{ value }}</div>
    <div class="text-sm text-gray-500">{{ prop.config.subtitle }}</div>
    <div v-if="prop.config.link" class="mt-2">
      <NuxtLink :to="prop.config.link" class="text-blue-500 text-sm hover:underline">
        مشاهده جزئیات
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const prop = defineProps({
  config: Object,
  dataSources: Array, // ✅ الان درست
})

const filtered = computed(() => {
  return prop.config?.filter ? prop.dataSources.filter(prop.config.filter) : prop.dataSources
})

const value = computed(() => prop.config?.compute?.(filtered.value) ?? '---')
</script>
