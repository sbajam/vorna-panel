<!-- components/widgets/StatCard.vue -->
<template>
  <div>
    <NuxtLink
      :to="prop.config.link"
    >
      <div class="text-2xl font-bold text-center">{{ value }}</div>
    </NuxtLink>
  </div>
</template>

<script setup>
import { computed,ref,onBeforeMount,watch, } from 'vue';

const prop = defineProps({
  config: Object,
  dataSources: Array, // ✅ الان درست
});

const filtered = computed(() => {
  return prop.config?.filter
    ? prop.dataSources.filter(prop.config.filter)
    : prop.dataSources;
});

const value = computed(() => prop.config?.compute?.(filtered.value) ?? "---");
</script>
