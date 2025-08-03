<template>
  <!--
    📦 BaseCard
    A reusable card container for dashboards and UI content.

    Props:
      - title: Optional card title (string)
      - withPadding: Enable/disable inner padding (default: true)

    Slots:
      - header: Optional custom header
      - default: Main content

    Notes:
      - Internal scroll area with custom scrollbar
  -->
  <div
    class=" rounded-lg border-2 border-gray-200 bg-white  overflow-hidden"
  >
    <!-- Header section -->
    <div v-if="$slots.header || title" class="p-4 border-b border-gray-100">
      <slot name="header" />
    </div>

    <!-- Scrollable content area -->
    <div
      class="max-h-[400px] overflow-auto"
      :class="{ 'p-4': withPadding }"
    >
      <slot name="widget" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  withPadding: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
/* Custom scrollbar styles */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}
</style>
