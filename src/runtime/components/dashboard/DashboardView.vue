<template>
  <Box class="!px-4 !pt-4 !pb-6">
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-800">{{ title }}</h2>

      <div class="flex items-center gap-2 text-gray-500">
        <button
          v-tooltip="'Pin to Favorites'"
          @click="$emit('pin')"
          class="hover:text-secondary-100 transition"
        >
          <Icon name="mdi:pin-outline" />
        </button>
        <button
          v-tooltip="'Settings'"
          @click="$emit('settings')"
          class="hover:text-blue-500 transition"
        >
          <Icon name="mdi:cog-outline" />
        </button>
        <button
          v-tooltip="'Delete Dashboard'"
          @click="$emit('delete')"
          class="hover:text-red-500 transition"
        >
          <Icon name="mdi:trash-can-outline" />
        </button>
      </div>
    </div>

    <!-- Grid -->
    <DashboardGrid
      v-if="widgetsWithData.length"
      :widgets="widgetsWithData"
      :dashboard-id="dashboardId"
      :cols="{ lg: 12 }"
      :row-height="30"
      :margin="[12, 12]"
    />
  </Box>
</template>

<script setup>
import {
  ref,
  useCookie,
  useNuxtApp,
  useRoute,
  navigateTo,
  useRouter,
  useRuntimeConfig,
  computed,
  onBeforeMount,
  watch,
  nextTick,
  onMounted
} from "#imports";

const props = defineProps({
  dashboardId: { type: String, required: true },
  title: { type: String, default: 'Dashboard' },
  widgetsWithData: { type: Array, default: () => [] },
})

defineEmits(['pin', 'settings', 'delete'])
</script>
