
<script setup lang="ts">
import { defineEmits } from 'vue'

const emits = defineEmits<{
  /** Emit when a field type is clicked */
  (e: 'selectFieldType', type: string): void
}>()

/** List of available field types */
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

/** تبدیل نام فنیِ فیلد به یک لیبل خوانا */
function formatLabel(type: string) {
  return type
    .replace(/([A-Z])/g, ' $1')    // CamelCase → فاصله‌گذاری بین حروف
    .replace(/^./, (str) => str.toUpperCase()) // حرف اول بزرگ
}

/** کاربر روی یکی از آیتم‌ها کلیک کرد */
function selectType(type: string) {
  emits('selectFieldType', type)
}
</script>
<template>
  <div>
    <h3 class="text-base sm:text-lg font-semibold mb-4 bg-black text-white px-4 py-2 rounded-md">
      Field Palette
    </h3>

    <div class="grid grid-cols-1 gap-3 sm:gap-4">
      <div
        v-for="type in fieldTypes"
        :key="type"
        class="p-3 sm:p-4 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition
               focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
        @click="selectType(type)"
        tabindex="0"
        @keydown.enter.prevent="selectType(type)"
        @keydown.space.prevent="selectType(type)"
      >
        {{ formatLabel(type) }}
      </div>
    </div>
  </div>
</template>



<style scoped>
/* سبک‌های خیلی مینیمال برای هم‌خوانی با تم */
:where(h3) {
  letter-spacing: 0.2px;
}
</style>



