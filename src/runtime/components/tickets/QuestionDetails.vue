<template>
     <Box
      v-if="items.length === 0"
      class="text-xl text-center text-primary-100 font-bold line-clamp-none"
    >
      موردی برای نمایش وجود ندارد.
    </Box>
  <section class="w-full flex flex-col-reverse lg:flex-row gap-4 justify-between">
    <!-- Master (List) -->
   
    <div
      v-if="items.length"
      :class="[
        'duration-300',
        activeId === null ? '!w-full lg:!w-10/12' : '!w-full lg:!w-[40%]',
      ]"
    >
      <Box class="divide-y">
        <slot name="filterbar" />

        <div
          v-for="(item, idx) in items"
          :key="itemKey ? item[itemKey] : idx"
          class="px-4 py-3 flex items-start gap-3 rounded-lg cursor-pointer hover:bg-secondary-10"
          @click="select(item)"
        >
          <slot name="list-item" :item="item" :index="idx" />
        </div>
      </Box>
    </div>

    <!-- Detail -->
    <div
      :class="[
        'duration-300',
        activeId === null ? '!w-full lg:!w-0' : '!w-full lg:!w-[55%]',
      ]"
    >
      <div v-if="activeItem" class="box">
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4"
        >
          <slot name="detail-header" :item="activeItem" />
        </div>

        <div class="prose prose-sm max-w-none rtl text-justify">
          <slot name="detail-body" :item="activeItem" />
        </div>

        <div class="mt-6">
          <slot name="detail-actions" :item="activeItem" />
        </div>
        <div class="mt-6">
          <slot name="detail-footer" :item="activeItem" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRoute, useRouter, useRuntimeConfig, navigateTo } from "nuxt/app";
import { computed,ref,onBeforeMount,watch,defineProps, nextTick, onMounted } from 'vue';

const props = defineProps<{
  items: any[];
  itemKey?: string; // شناسه‌ی یکتا مثل 'id'
  modelValue?: number | string | null; // id آیتم انتخاب‌شده (اختیاری)
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: number | string | null): void;
  (e: "select", payload: { item: any }): void;
}>();

const internalId = ref<number | string | null>(props.modelValue ?? null);
const activeId = computed({
  get: () => props.modelValue ?? internalId.value,
  set: (v) => {
    internalId.value = v;
    emit("update:modelValue", v);
  },
});

const activeItem = computed(() => {
  if (activeId.value == null) return null;
  const key = props.itemKey ?? "id";
  return props.items.find((i) => i?.[key] === activeId.value) ?? null;
});

function select(item: any) {
  const key = props.itemKey ?? "id";
  activeId.value = item?.[key] ?? null;
  emit("select", { item });
}
</script>

<style scoped>
.rtl {
  direction: rtl;
}
</style>
