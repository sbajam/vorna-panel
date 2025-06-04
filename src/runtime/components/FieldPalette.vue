<template>
  <div>
    <h3 class="text-lg font-medium mb-4">Field Palette</h3>
    <div class="grid grid-cols-1 gap-4">
      <div
        v-for="type in fieldTypes"
        :key="type"
        class="p-3 bg-white border rounded shadow cursor-grab hover:bg-gray-50"
        draggable="true"
        @dragstart="handleDragStart($event, type)"
      >
        {{ formatLabel(type) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue'
const emits = defineEmits<{
  (e: 'startDrag', type: string): void
}>()

const fieldTypes = [
  'text',
  'email',
  'number',
  'password',
  'textarea',
  'date',
  'select',
  'checkboxGroup',
  'radioGroup',
  'toggle',
  'file',
  'richtext',
  'array',
]

function formatLabel(type: string) {
  return type
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
}

// هنگامی که درگ شروع می‌شود، فقط event emit می‌کنیم
function handleDragStart(event: DragEvent, type: string) {
  // می‌توانیم داده را در dataTransfer نیز ست کنیم اگر لازم داریم
  event.dataTransfer?.setData('text/plain', type)
  event.dataTransfer!.effectAllowed = 'copy'
  emits('startDrag', type)
}
</script>

<style scoped>
/* استایل خاص خود را اینجا بنویسید */
</style>
