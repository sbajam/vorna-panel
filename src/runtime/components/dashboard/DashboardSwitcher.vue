<template>
  <!--
    📘 DashboardSwitcher
    Displays a horizontal list of dashboards with icons and a final "add new" button.

    Props:
      - dashboards: Array of dashboard objects { id, name, icon }

    Emits:
      - select(dashboard): Emitted when a dashboard is clicked
      - create(): Emitted when the "+" button is clicked

    Notes:
      - Uses nuxt-icon <Icon> for icons
      - Scrollable horizontally with a custom thin scrollbar
  -->
  <Box class="w-full overflow-x-auto !py-4 !px-4 !mb-0">
    <div
      class="flex items-center gap-2 min-w-fit px-2 py-1"
      style="scrollbar-width: thin;"
    >
      <!-- Dashboard buttons -->
      <button
        v-for="dashboard in dashboards"
        :key="dashboard.id"
        @click="$emit('select', dashboard)"
        class="flex flex-col aspect-square items-center justify-center w-16 shrink-0 rounded-full border-2 border-primary-100 text-primary-100 hover:bg-primary-10 hover:shadow-none duration-200 transition"
      >
        <span class="flex items-center justify-center rounded-full  text-sm font-medium">
          <!-- Render icon if provided, fallback to first letter -->
          <Icon
            v-if="dashboard.icon"
            :name="dashboard.icon"
            size="20"
          />
          <span v-else>
            {{ dashboard.name?.slice(0, 1)?.toUpperCase() || '?' }}
          </span>
        </span>
        <span class="text-[8px] mt-1 text-center truncate w-full">
          {{ dashboard.name }}
        </span>
      </button>

      <!-- Add new dashboard button -->
      <button
        @click="$emit('create')"
        class="flex flex-col aspect-square items-center justify-center w-16 shrink-0 rounded-full border-2 border-dashed border-gray-400 text-gray-500 hover:bg-gray-100 transition"
      >
        <span class="flex items-center justify-center text-2xl">
          <Icon name="ic:baseline-add" size="20" />
        </span>
      </button>
    </div>
  </Box>
</template>

<script setup>
defineProps({
  dashboards: {
    type: Array,
    default: () => [],
  },
})
defineEmits(['select', 'create'])
</script>

<style scoped>
/* Thin horizontal scrollbar styling */
::-webkit-scrollbar {
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
</style>
