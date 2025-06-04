<template>
  <div>
    <h3 class="text-lg font-medium mb-4">تنظیمات بخش</h3>
    <div class="space-y-4">
      <!-- Title -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">عنوان بخش</label>
        <input
          type="text"
          v-model="localSection.title"
          @input="emitUpdate"
          class="w-full border rounded px-2 py-1"
        />
      </div>

      <!-- Collapsible -->
      <div class="flex items-center">
        <input
          type="checkbox"
          id="collapsible"
          v-model="localSection.collapsible"
          @change="emitUpdate"
          class="mr-2"
        />
        <label for="collapsible" class="text-sm font-medium text-gray-700">
          Collapsible
        </label>
      </div>

      <!-- شروع باز شده یا بسته (_open) -->
      <div class="flex items-center">
        <input
          type="checkbox"
          id="_open"
          v-model="localSection._open"
          @change="emitUpdate"
          class="mr-2"
        />
        <label for="_open" class="text-sm font-medium text-gray-700">
          شروع باز باشد
        </label>
      </div>

      <!-- دکمه حذف سکشن -->
      <div class="pt-4 border-t">
        <button
          class="w-full text-red-600 border border-red-600 rounded px-3 py-1 hover:bg-red-50"
          @click="confirmDelete"
        >
          حذف بخش
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineEmits, defineProps } from 'vue'

const emits = defineEmits<{
  (e: 'updateSection', section: any): void
  (e: 'deleteSection', idx: number): void
}>()

const props = defineProps<{
  section: any
  index: number
}>()

const localSection = ref({ ...props.section })

// سینک با prop جدید
watch(
  () => props.section,
  (newS) => {
    localSection.value = { ...newS }
  }
)

function emitUpdate() {
  emits('updateSection', { ...localSection.value })
}

function confirmDelete() {
  if (window.confirm('آیا مطمئن هستید که می‌خواهید این بخش را حذف کنید؟')) {
    emits('deleteSection', props.index)
  }
}
</script>
