<template>
  <div class="p-4 bg-white border rounded-lg shadow-md w-full space-y-4">
    <!-- ===== Header ===== -->
    <h3 class="text-lg font-medium">تنظیمات بخش</h3>

    <!-- ===== Section Title ===== -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">عنوان بخش</label>
      <input
        v-model="localTitle"
        @input="emitUpdate('title', localTitle)"
        type="text"
        class="w-full px-2 py-1 border rounded"
        placeholder="مثلاً: اطلاعات پایه"
      />
    </div>

    <!-- ===== Collapsible Toggle ===== -->
    <div class="flex items-center space-x-2">
      <input
        type="checkbox"
        v-model="localCollapsible"
        @change="emitUpdate('collapsible', localCollapsible)"
        class="form-checkbox h-5 w-5 text-blue-600"
        id="collapsibleCheckbox"
      />
      <label for="collapsibleCheckbox" class="text-sm">امکان باز/بسته شدن</label>
    </div>

    <!-- ===== If collapsible: Default Open State ===== -->
    <div v-if="localCollapsible">
      <label class="inline-flex items-center text-sm">
        <input
          type="checkbox"
          v-model="localDefaultOpen"
          @change="emitUpdate('_open', localDefaultOpen)"
          class="form-checkbox h-5 w-5 text-blue-600"
          id="defaultOpenCheckbox"
        />
        <span class="ml-2">به طور پیش‌فرض باز باشد</span>
      </label>
    </div>

    <!-- ===== Bottom Buttons ===== -->
    <div class="flex justify-end space-x-2">
      <button
        @click="onClose"
        class="px-3 py-1 text-gray-700 border rounded hover:bg-gray-100"
      >
        بستن
      </button>
      <button
        @click="onDelete"
        class="px-3 py-1 text-red-700 border border-red-700 rounded hover:bg-red-50"
      >
        حذف بخش
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// -------------------------------
// Part 1: Props and Emits
// -------------------------------

import { ref, watch } from "vue";
import type { PropType } from "vue";

// دریافت sectionConfig از والد
const props = defineProps<{
  section: {
    title: string;
    collapsible?: boolean;
    _open?: boolean;
    fields: any[]; // فقط برای نمایش کلیدها نیاز نداریم
  };
}>();

// ایونت‌هایی که قابل emit هستند
const emit = defineEmits<{
  (e: "updateSection", updatedSection: typeof props.section): void;
  (e: "deleteSection"): void;
  (e: "closePanel"): void;
}>();

// -------------------------------
// Part 2: Local Reactive State
// -------------------------------

// عنوان بخش
const localTitle = ref(props.section.title);

// آیا بخش Collapsible است؟
const localCollapsible = ref(!!props.section.collapsible);

// اگر Collapsible است، آیا به طور پیش‌فرض باز باشد؟
const localDefaultOpen = ref(!!props.section._open);

// -------------------------------
// Part 3: Watch Prop Changes
// -------------------------------

watch(
  () => props.section,
  (newSec) => {
    localTitle.value = newSec.title;
    localCollapsible.value = !!newSec.collapsible;
    localDefaultOpen.value = !!newSec._open;
  },
  { immediate: true }
);

// -------------------------------
// Part 4: Helper to Emit Updates
// -------------------------------

// وقتی فقط یکی از صفت‌های section عوض شد:
function emitUpdate(propName: keyof typeof props.section, value: any) {
  // کل شیٔ section را shallow copy می‌کنیم و فقط صفت مربوطه را تغییر می‌دهیم:
  const updated = { ...props.section, [propName]: value };
  emit("updateSection", updated);
}

// وقتی روی “حذف بخش” کلیک شود
function onDelete() {
  emit("deleteSection");
}

// وقتی روی “بستن” کلیک شود
function onClose() {
  emit("closePanel");
}
</script>

<style scoped>
/* در صورت نیاز می‌توانید استایل اضافه کنید */
</style>
