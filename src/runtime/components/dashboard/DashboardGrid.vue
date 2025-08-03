<template>
  <div class="dashboard-grid min-h-[400px]">
    <ClientOnly>
      <GridLayout
        v-if="layouts[currentBreakpoint]?.length"
        :layouts="layouts"
        :layout="layouts[currentBreakpoint]"
        :cols="{ lg: 12, md: 8, sm: 4, xs: 2 }"
        :breakpoints="{ lg: 1200, md: 996, sm: 768, xs: 480 }"
        :row-height="getRowHeight(currentBreakpoint)"
        :is-draggable="true"
        :is-resizable="true"
        :vertical-compact="false"
        :margin="[10, 10]"
        @layout-updated="onLayoutChange"
        @breakpoint-changed="onBreakpointChanged"
      >
        <GridItem
          v-for="item in layouts[currentBreakpoint]"
          :key="item.i"
          :i="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
        >
          <DashboardWidget
            v-if="widgetMap[item.i]"
            :config="widgetMap[item.i]"
            :dataSources="widgetMap[item.i]?.dataSources || {}"
            class="w-full h-full overflow-x-hidden overflow-y-auto"
          />

          <!-- TODO: نمایش نوار ابزار ویجت (حذف، تنظیمات، ... در فاز ۵ و ۶) -->
        </GridItem>
      </GridLayout>
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { GridLayout, GridItem } from "vue3-grid-layout";
import DashboardWidget from "./DashboardWidget.vue";

// props
const props = defineProps({
  widgets: { type: Array, required: true },
  dashboardId: { type: String, required: true },
});

// ذخیره‌سازی و وضعیت
const currentBreakpoint = ref("lg");
const storageKey = `dashboard-layout-${props.dashboardId}`;

// دسترسی سریع به کانفیگ ویجت‌ها
const widgetMap = computed(() =>
  props.widgets.reduce((acc, w) => {
    acc[w.id] = w;
    return acc;
  }, {})
);

// layout اولیه
const baseLayout = computed(() =>
  (props.widgets || []).map((w, i) => ({
    i: w.id,
    x: 0,
    y: i * 10, // یکی زیر یکی
    w: 12,     // عرض کامل (مثلاً برای lg = 12 ستون)
    h: 10      // ارتفاع پیش‌فرض
  }))
)


function scaleLayout(layout, fromCols, toCols) {
  return layout.map((item, i) => ({
    ...item,
    x: 0,
    y: i * 10,
    w: toCols,
    h: item.h
  }))
}


// layouts برای breakpoints مختلف
const layouts = ref({
  lg: baseLayout.value,
  md: scaleLayout(baseLayout.value, 12, 8),
  sm: scaleLayout(baseLayout.value, 12, 6),
  xs: scaleLayout(baseLayout.value, 12, 4),
});

// layout فعال جاری برای v-for
const currentLayout = computed(() => {
  const bp = currentBreakpoint.value;
  const layout = layouts.value[bp];
  if (!Array.isArray(layout)) return [];
  return layout.filter(
    (item) => item && typeof item.x === "number" && typeof item.i === "string"
  );
});

// مقداردهی اولیه و بارگذاری layout از localStorage

onMounted(() => {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      layouts.value = JSON.parse(saved);
      // TODO: در فاز ۲ - بارگذاری layout از Pinia یا API در صورت فعال بودن persistence
    } catch (err) {
      console.warn("layout parsing error:", err);
    }
  } else {
    layouts.value = {
      lg: baseLayout.value,
      md: scaleLayout(baseLayout.value, 12, 8),
      sm: scaleLayout(baseLayout.value, 12, 4),
      xs: scaleLayout(baseLayout.value, 12, 2),
    };
  }

  console.log("📦 Layouts:", JSON.parse(JSON.stringify(layouts.value)));
});

// ذخیره layout جدید در localStorage
function onLayoutChange(updatedLayout) {
  layouts.value[currentBreakpoint.value] = updatedLayout;
  localStorage.setItem(storageKey, JSON.stringify(layouts.value));

  // TODO: در فاز ۷ - ارسال layout به API برای ذخیره دائمی
  // emit('update:layout', updatedLayout)
}
watch(currentBreakpoint, (val) => {
  console.log("📱 Breakpoint changed:", val);
});
import { useWindowSize } from '@vueuse/core'

const { width } = useWindowSize()

watch(width, (w) => {
  if (w >= 1200) currentBreakpoint.value = 'lg'
  else if (w >= 996) currentBreakpoint.value = 'md'
  else if (w >= 768) currentBreakpoint.value = 'sm'
  else currentBreakpoint.value = 'xs'
})

// بروزرسانی breakpoint فعلی
function onBreakpointChanged(bp) {
  currentBreakpoint.value = bp;
  console.log(currentBreakpoint.value)
}

// ارتفاع ردیف‌ها بر اساس breakpoint
function getRowHeight(bp) {
  return { lg: 10, md: 100, sm: 120, xs: 140 }[bp] || 80;
}
</script>
