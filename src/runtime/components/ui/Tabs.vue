<script setup lang="ts">
// ──────────────────────────────────────────────────────────────────────────────
// File: src/runtime/components/ui/Tabs.vue
// API: اسلات‌بیس و کوئری‌محور
//  - props.items: آرایه‌ای از { label, value, disabled? }
//  - props.queryKey: اسم پارامتر کوئری (پیش‌فرض: 'tab')
//  - تب Active از روی ?[queryKey]=value گرفته می‌شود
//  - رندر پنل‌ها از طریق اسلات‌های نام‌گذاری‌شده به شکل `panel:<value>`
//  - اسلات اختیاری `tab` برای سفارشی‌سازی لیبل دکمه
//  - ریسپانسیو: موبایل اسکرول افقی + snap؛ md+ گرید چندستونه + wrap
//  - هم‌قدسازی دکمه‌ها به اندازه بلندترین با v-equalize داخلی
//  - ناوبری کیبورد: Arrow/Home/End/Enter
// ──────────────────────────────────────────────────────────────────────────────

import { ref, computed, watch, nextTick, onMounted } from "vue";
import { useRoute, useRouter } from "#imports";

export interface TabItem {
  label: string;
  value: string | number;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    items: TabItem[];
    queryKey?: string;
    dir?: "rtl" | "ltr" | "auto";
    mdCols?: number;
  }>(),
  {
    queryKey: "tab",
    dir: "auto",
    mdCols: 4,
  }
);

const route = useRoute();
const router = useRouter();

const listEl = ref<HTMLElement | null>(null);
const focusedIndex = ref(0);

const activeValue = computed<string | number>({
  get() {
    const q = route.query[props.queryKey as any];
    if (q == null) return props.items?.[0]?.value ?? 0;
    return Array.isArray(q) ? q[0] : q;
  },
  set(v) {
    const q = { ...route.query, [props.queryKey]: String(v) };
    router.replace({ query: q });
  },
});

function onClickTab(t: TabItem, i: number) {
  if (t.disabled) return;
  activeValue.value = t.value;
  nextTick(() => {
    const btn =
      listEl.value?.querySelectorAll<HTMLElement>("[data-tab-btn]")?.[i];
    btn?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  });
}

watch(
  () => route.query[props.queryKey],
  () => {
    /* sync happens via computed setter/getter */
  }
);

onMounted(() => {
  // اطمینان از اینکه مقدار اولیه معتبر است
  const exists = props.items.some(
    (i) => String(i.value) === String(activeValue.value)
  );
  if (!exists && props.items.length) activeValue.value = props.items[0].value;
});

function onKeydown(e: KeyboardEvent) {
  const max = props.items.length - 1;
  if (max < 0) return;
  const dirMul = props.dir === "rtl" ? -1 : 1;
  if (e.key === "ArrowRight") {
    focusedIndex.value =
      (focusedIndex.value + 1 * dirMul + (max + 1)) % (max + 1);
    focusBtn(focusedIndex.value);
    e.preventDefault();
  } else if (e.key === "ArrowLeft") {
    focusedIndex.value =
      (focusedIndex.value - 1 * dirMul + (max + 1)) % (max + 1);
    focusBtn(focusedIndex.value);
    e.preventDefault();
  } else if (e.key === "Home") {
    focusedIndex.value = 0;
    focusBtn(0);
    e.preventDefault();
  } else if (e.key === "End") {
    focusedIndex.value = max;
    focusBtn(max);
    e.preventDefault();
  } else if (e.key === "Enter" || e.key === " ") {
    const t = props.items[focusedIndex.value];
    onClickTab(t, focusedIndex.value);
    e.preventDefault();
  }
}

function tabId(v: string | number) {
  return `tab-${props.queryKey}-${v}`;
}
function panelId(v: string | number) {
  return `panel-${props.queryKey}-${v}`;
}
function focusBtn(i: number) {
  const btn =
    listEl.value?.querySelectorAll<HTMLElement>("[data-tab-btn]")?.[i];
  btn?.focus();
}

/* Local directive: v-equalize (height/width by largest) */
const vEqualize = {
  mounted(el: HTMLElement, binding: any) {
    const opts = binding.value as { selector: string; by?: "height" | "width" };
    const measure = () => {
      const nodes = Array.from(el.querySelectorAll<HTMLElement>(opts.selector));
      if (!nodes.length) return;
      nodes.forEach((n) => {
        n.style.minHeight = "";
        n.style.minWidth = "";
      });
      const by = opts.by ?? "height";
      const max = nodes.reduce((m, n) => {
        const r = n.getBoundingClientRect();
        const v = by === "height" ? r.height : r.width;
        return Math.max(m, v);
      }, 0);
      nodes.forEach((n) => {
        if (by === "height") n.style.minHeight = `${Math.ceil(max)}px`;
        else n.style.minWidth = `${Math.ceil(max)}px`;
      });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const mo = new MutationObserver(measure);
    mo.observe(el, { subtree: true, childList: true, characterData: true });
    (el as any)._eqCleanup = () => {
      ro.disconnect();
      mo.disconnect();
    };
    requestAnimationFrame(measure);
  },
  updated(el: HTMLElement, binding: any) {
    const opts = binding.value as { selector: string; by?: "height" | "width" };
    const nodes = Array.from(el.querySelectorAll<HTMLElement>(opts.selector));
    const by = opts.by ?? "height";
    let max = 0;
    nodes.forEach((n) => {
      n.style.minHeight = "";
      n.style.minWidth = "";
      const r = n.getBoundingClientRect();
      const v = by === "height" ? r.height : r.width;
      max = Math.max(max, v);
    });
    nodes.forEach((n) => {
      if (by === "height") n.style.minHeight = `${Math.ceil(max)}px`;
      else n.style.minWidth = `${Math.ceil(max)}px`;
    });
  },
  unmounted(el: HTMLElement) {
    (el as any)._eqCleanup?.();
  },
};

// رجیستر دایرکتیو محلی
// (اگر ماژول دارید که دایرکتیوها را سراسری ثبت می‌کند، این بخش را حذف کنید و آن مسیر را استفاده کنید)
// eslint-disable-next-line vue/no-setup-props-destructure
// @ts-ignore - Vue local directives in SFC
defineExpose({});
</script>

<script lang="ts">
// رجیستر دایرکتیو به شکل محلی داخل همین فایل
export default {
  directives: { equalize: {} as any },
};
</script>

<template>
  <div class="w-full" :dir="dir">
    <!-- Header: mobile scroll, md+ grid with wrapping -->
    <div
      ref="listEl"
      class="tabs-header"
      role="tablist"
      aria-orientation="horizontal"
      v-equalize="{ selector: '[data-tab-btn]', by: 'height' }"
      @keydown="onKeydown"
    >
      <button
        v-for="(t, i) in items"
        :key="t.value"
        data-tab-btn
        class="tab-btn"
        :class="{
          'is-active': t.value === activeValue,
          'is-disabled': t.disabled,
        }"
        role="tab"
        :aria-selected="t.value === activeValue"
        :aria-controls="panelId(t.value)"
        :id="tabId(t.value)"
        :tabindex="t.value === activeValue ? 0 : -1"
        :disabled="!!t.disabled"
        @click="onClickTab(t, i)"
        @focus="focusedIndex = i"
      >
        <slot name="tab" :item="t" :index="i">
          <span class="whitespace-nowrap text-sm w-fit leading-6">{{ t.label }}</span>
        </slot>
      </button>
    </div>

    <!-- Panels: اسلات به نام panel:<value> -->
    <div class="tabs-panels">
      <section
        v-for="(t, i) in items"
        :key="t.value"
        class="tab-panel"
        role="tabpanel"
        :id="panelId(t.value)"
        :aria-labelledby="tabId(t.value)"
        :hidden="t.value !== activeValue"
      >
        <template v-if="t.value === activeValue">
          <slot :name="`panel:${t.value}`" :item="t" :index="i">
            <!-- اگر اسلاتی با این نام تعریف نشده بود، fallback -->
            <div class="text-sm text-gray-500">
              اسلات <code>panel:{{ t.value }}</code> تعریف نشده است.
            </div>
          </slot>
        </template>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* تغییرات برای نوار اسکرول */
::-webkit-scrollbar {
  width: 2px; /* نوار اسکرول نازک */
  border-radius: 9999px; /* گوشه‌های گرد */
}

::-webkit-scrollbar-track {
  background: #f8fafc; /* رنگ پس‌زمینه خاکستری روشن */
  border-radius: 9999px; /* گوشه‌های گرد */
}

::-webkit-scrollbar-thumb {
  background: #e5e7eb; /* رنگ خاکستری برای نوار اسکرول */
  border-radius: 9999px; /* گوشه‌های گرد */
  transition: background-color 0.3s ease; /* افکت تغییر رنگ */
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af; /* تغییر رنگ در حالت hover */
}


/* Header container: برای اسکرول افقی با ظاهر جدید */
.tabs-header {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x proximity;
  padding: 0.25rem;
  padding-bottom: 0.5rem;
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: #b0b0b0 transparent; /* Firefox */
}

/* در سایزهای بزرگتر نمایش به شکل گرید */
@media (min-width: 768px) {
  .tabs-header {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(var(--tabs-md-cols, 4), minmax(0, 1fr));
    overflow: visible;
  }
}

/* دکمه‌های تب */
.tab-btn {
  @apply text-primary-100;
  scroll-snap-align: center;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  font-weight: 700;
  line-height: 1.5rem;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  min-width: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: normal;
  word-break: break-word;
  border: 2px solid transparent;
}

.tab-btn.is-active {
  @apply bg-primary-100;
  color: #fff;
}

.tab-btn.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tab-panel {
  margin-top: 1rem;
}
</style>
