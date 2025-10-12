<template>
  <!--
    ⭐ DashboardFavorites
    Shows a scrollable list of favorite dashboards, each linking to a route.

    Props:
      - favorites: Array of { id, name, icon, to } (to = route path)

    Emits:
      - select(item): emitted when a favorite is clicked
      - remove(item): emitted when remove (x) is clicked
      - add(): emitted when the "+" button is clicked

    Notes:
      - Thin horizontal scrollbar
  -->
  <Box class="w-full overflow-x-auto !py-4 !px-4 !mb-0">
    <div class="flex items-center gap-2 min-w-fit px-2 py-1" style="scrollbar-width: thin;">
      <!-- Favorites -->
      <NuxtLink
        v-for="item in favorites"
        :key="item.id"
        :to="item.to || '/'"
        class="relative flex flex-col aspect-square items-center justify-center w-16 shrink-0 rounded-full border-2 border-secondary-100 text-secondary-100 hover:bg-secondary-10 hover:shadow-none transition duration-200"
        @click.native="$emit('select', item)"
      >
        <span class="flex items-center justify-center rounded-full  text-sm font-medium">
          <Icon
            v-if="item.icon"
            :name="item.icon"
            size="20"
          />
          <span v-else>
            {{ item.name?.slice(0, 1)?.toUpperCase() || '?' }}
          </span>
        </span>
        <span class="text-[8px] mt-1 text-center truncate w-full">
          {{ item.name }}
        </span>

        <!-- Remove button -->
        <button
          class="absolute -top-1 -right-1 bg-white text-red-500 rounded-full w-4 h-4 text-[10px] flex items-center justify-center hover:bg-red-50"
          @click.stop="$emit('remove', item)"
        >×</button>
      </NuxtLink>

      <!-- Add new favorite -->
      <button
        @click="$emit('add')"
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

defineProps({
  favorites: {
    type: Array,
    default: () => [],
  },
})
defineEmits(['select', 'remove', 'add'])
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
