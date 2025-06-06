<template>
  <div>
    <h3 class="text-lg font-medium mb-4">Field Palette</h3>
    <div class="grid grid-cols-1 gap-4">
      <div
        v-for="type in fieldTypes"
        :key="type"
        class="p-3 bg-white border rounded shadow cursor-pointer hover:bg-gray-50"
        @click="selectType(type)"
      >
        {{ formatLabel(type) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue'

const emits = defineEmits<{
  /**‌وقتی روی یک نوع فیلد کلیک شد، این ایونت emit شود */
  (e: 'selectFieldType', type: string): void
}>()

/** لیست انواع فیلدهایی که قابل اضافه شدن هستند */
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

<style scoped>
/* استایلی که خودتان می‌توانید تغییرش دهید */
</style>
