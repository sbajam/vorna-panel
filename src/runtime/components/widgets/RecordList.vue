<template>
  <ul class="space-y-2">
    <li
      v-for="(item, index) in limitedItems"
      :key="index"
      class="flex justify-between items-center bg-gray-50 hover:bg-gray-100 rounded px-3 py-2 transition"
    >
      <NuxtLink
        :to="getLink(item)"
        class="text-sm font-medium text-gray-800 hover:underline"
      >
        {{ getTitle(item) }}
      </NuxtLink>
    </li>
    <li v-if="limitedItems.length === 0" class="text-sm text-gray-400 italic">
      آیتمی یافت نشد.
    </li>
  </ul>
</template>

<script setup>
import { computed, ref, onBeforeMount, watch } from "vue";

const props = defineProps({
  config: {
    type: Object,
    required: true,
  },
  dataSources: {
    type: Array,
    required: true,
  },
});

const filtered = computed(() => {
  // اعمال فیلتر دلخواه
  return props.config.filter
    ? props.dataSources.filter(props.config.filter)
    : props.dataSources;
});

// محدود کردن تعداد نمایش
const limitedItems = computed(() =>
  filtered.value.slice(0, props.config.limit ?? 5)
);

// تابع استخراج عنوان: پشتیبانی از renderItem داخلی
function getTitle(item) {
  if (typeof props.config.renderItem === "function") {
    const result = props.config.renderItem(item);
    return result != null ? result : "---";
  }
  const field = props.config.fields?.[0] ?? "title";
  return item?.[field] ?? "---";
}

// تابع تولید لینک: پشتیبانی از getLink یا linkBase
function getLink(item) {
  if (typeof props.config.getLink === "function") {
    return props.config.getLink(item);
  }
  const base = props.config.linkBase ?? "#";
  const id = item?.id != null ? item.id : "";
  return `${base}${id}`;
}
</script>
