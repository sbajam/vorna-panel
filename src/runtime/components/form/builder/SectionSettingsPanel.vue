<script setup lang="ts">
// -------------------------------
// Part 1: Props and Emits
// -------------------------------

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
  onMounted,
} from "#imports";

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
<template>
  <div
    class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm w-full space-y-4"
  >
    <!-- ===== Header ===== -->
    <h3
      class="text-base sm:text-lg font-semibold bg-black text-white px-4 py-2 rounded-md"
    >
      Section Settings
    </h3>

    <!-- ===== Section Title ===== -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1"
        >Section Title</label
      >
      <input
        v-model="localTitle"
        @input="emitUpdate('title', localTitle)"
        type="text"
        class="w-full px-3 py-2 border border-gray-200 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
        placeholder="e.g. Basic Info"
      />
    </div>

    <!-- ===== Collapsible Toggle ===== -->
    <div class="flex items-center gap-2">
      <input
        type="checkbox"
        v-model="localCollapsible"
        @change="emitUpdate('collapsible', localCollapsible)"
        class="h-4 w-4 rounded border-gray-300 accent-black"
        id="collapsibleCheckbox"
      />
      <label for="collapsibleCheckbox" class="text-sm">Collapsible</label>
    </div>

    <!-- ===== If collapsible: Default Open State ===== -->
    <div v-if="localCollapsible">
      <label class="inline-flex items-center text-sm">
        <input
          type="checkbox"
          v-model="localDefaultOpen"
          @change="emitUpdate('_open', localDefaultOpen)"
          class="h-4 w-4 rounded border-gray-300 accent-black"
          id="defaultOpenCheckbox"
        />
        <span class="ms-2">Open by Default</span>
      </label>
    </div>

    <!-- ===== Bottom Buttons ===== -->
    <div class="flex justify-end gap-2">
      <button
        @click="onClose"
        class="px-3 py-2 bg-black text-white rounded-md border border-black transition hover:-translate-y-px"
      >
        Close
      </button>
      <button
        @click="onDelete"
        class="px-3 py-2 bg-white text-red-600 border border-red-600 rounded-md transition hover:bg-red-50"
      >
        Delete Section
      </button>
    </div>
  </div>
</template>

<style scoped>
:where(h3) {
  letter-spacing: 0.2px;
}
</style>
