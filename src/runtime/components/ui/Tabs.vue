// ──────────────────────────────────────────────────────────────────────────────
// File: src/runtime/components/ui/Tabs.vue
// Description: یک کامپوننت واحد Tabs با همه‌ی قابلیت‌ها (ریسپانسیو + هم‌قدسازی +
//   همگام‌سازی query + کیبورد نویگیشن). قابل کپی/پیست در پروژه.
// ──────────────────────────────────────────────────────────────────────────────
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
        v-for="(t, i) in resolvedTabs"
        :key="t.key ?? i"
        data-tab-btn
        class="tab-btn"
        :class="{ 'is-active': i === currentIndex, 'is-disabled': t.disabled }"
        role="tab"
        :aria-selected="i === currentIndex"
        :aria-controls="panelId(i)"
        :id="tabId(i)"
        :tabindex="i === currentIndex ? 0 : -1"
        :disabled="!!t.disabled"
        @click="activate(i, true)"
        @focus="focusedIndex = i"
      >
        <slot name="tab" :tab="t" :index="i">
          <span class="truncate leading-6">{{ t.label }}</span>
        </slot>
      </button>
    </div>

    <!-- Panels -->
    <div class="tabs-panels">
      <section
        v-for="(t, i) in resolvedTabs"
        :key="t.key ?? i"
        class="tab-panel"
        role="tabpanel"
        :id="panelId(i)"
        :aria-labelledby="tabId(i)"
        :hidden="i !== currentIndex"
      >
        <keep-alive v-if="keepAlive">
          <component :is="t.component" v-if="i === currentIndex" v-bind="t.props" />
        </keep-alive>
        <component :is="t.component" v-else-if="!keepAlive && i === currentIndex" v-bind="t.props" />
        <template v-else-if="!t.component && i === currentIndex">
          <slot :name="`panel:${t.key ?? i}`" />
        </template>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from '#imports'

/* Props */
export interface TabItem {
  key?: string | number
  label: string
  disabled?: boolean
  component?: any
  props?: Record<string, any>
}

const props = withDefaults(defineProps<{
  tabs?: TabItem[]
  modelValue?: number
  querySync?: boolean
  queryKey?: string
  keepAlive?: boolean
  dir?: 'rtl' | 'ltr' | 'auto'
  mdCols?: number // تعداد ستون‌های Grid در md+
}>(), {
  tabs: undefined,
  modelValue: 0,
  querySync: true,
  queryKey: 'tab',
  keepAlive: false,
  dir: 'auto',
  mdCols: 4,
})

const emit = defineEmits<{ (e:'update:modelValue', v:number):void; (e:'change', p:{ index:number; key?:string|number }):void }>()

const route = useRoute();
const router = useRouter();

const listEl = ref<HTMLElement|null>(null)
const focusedIndex = ref(0)

const queryIndex = computed(() => {
  if (!props.querySync) return null
  const raw = route.query[props.queryKey as any]
  if (raw == null) return null
  const i = Number(raw)
  return Number.isFinite(i) ? i : 0
})

const currentIndex = ref<number>(queryIndex.value ?? props.modelValue ?? 0)

const resolvedTabs = computed<TabItem[]>(() => props.tabs ?? [])

function tabId(i:number){ return `tab-${props.queryKey}-${i}` }
function panelId(i:number){ return `panel-${props.queryKey}-${i}` }

function activate(i:number, pushHistory=false){
  if (resolvedTabs.value[i]?.disabled) return
  currentIndex.value = i
  emit('update:modelValue', i)
  emit('change', { index: i, key: resolvedTabs.value[i]?.key })
  if (props.querySync){
    const q = { ...route.query, [props.queryKey]: String(i) }
    router[pushHistory ? 'push' : 'replace']({ query: q })
  }
  nextTick(() => {
    const btn = listEl.value?.querySelectorAll<HTMLElement>('[data-tab-btn]')?.[i]
    btn?.scrollIntoView({ inline:'center', block:'nearest', behavior:'smooth' })
  })
}

watch(() => route.query[props.queryKey], (nv) => {
  if (!props.querySync) return
  if (nv == null) return
  const i = Number(nv)
  if (Number.isFinite(i) && i !== currentIndex.value) currentIndex.value = i
})

onMounted(() => { activate(currentIndex.value, false) })

function onKeydown(e: KeyboardEvent){
  const max = resolvedTabs.value.length - 1
  if (max < 0) return
  const dirMul = (props.dir === 'rtl') ? -1 : 1
  if (e.key === 'ArrowRight') { focusedIndex.value = (focusedIndex.value + 1*dirMul + (max+1)) % (max+1); focusBtn(focusedIndex.value); e.preventDefault() }
  else if (e.key === 'ArrowLeft') { focusedIndex.value = (focusedIndex.value - 1*dirMul + (max+1)) % (max+1); focusBtn(focusedIndex.value); e.preventDefault() }
  else if (e.key === 'Home') { focusedIndex.value = 0; focusBtn(0); e.preventDefault() }
  else if (e.key === 'End') { focusedIndex.value = max; focusBtn(max); e.preventDefault() }
  else if (e.key === 'Enter' || e.key === ' ') { activate(focusedIndex.value, true); e.preventDefault() }
}

function focusBtn(i:number){
  const btn = listEl.value?.querySelectorAll<HTMLElement>('[data-tab-btn]')?.[i]
  btn?.focus()
}

/* Local directive: v-equalize */
const vEqualize = {
  mounted(el: HTMLElement, binding: any){
    const opts = binding.value as { selector:string; by?:'height'|'width' }
    const measure = () => {
      const nodes = Array.from(el.querySelectorAll<HTMLElement>(opts.selector))
      if (!nodes.length) return
      nodes.forEach(n => { n.style.minHeight=''; n.style.minWidth='' })
      const by = opts.by ?? 'height'
      const max = nodes.reduce((m, n) => {
        const r = n.getBoundingClientRect(); const v = by==='height'? r.height : r.width; return Math.max(m, v)
      }, 0)
      nodes.forEach(n => { if (by==='height') n.style.minHeight = `${Math.ceil(max)}px`; else n.style.minWidth = `${Math.ceil(max)}px` })
    }
    const ro = new ResizeObserver(measure); ro.observe(el)
    const mo = new MutationObserver(measure); mo.observe(el, { subtree:true, childList:true, characterData:true })
    ;(el as any)._eqCleanup = () => { ro.disconnect(); mo.disconnect() }
    requestAnimationFrame(measure)
  },
  updated(el: HTMLElement, binding: any){
    const opts = binding.value as { selector:string; by?:'height'|'width' }
    const nodes = Array.from(el.querySelectorAll<HTMLElement>(opts.selector))
    const by = opts.by ?? 'height'
    let max = 0
    nodes.forEach(n => { n.style.minHeight=''; n.style.minWidth=''; const r = n.getBoundingClientRect(); const v = by==='height'? r.height : r.width; max = Math.max(max, v) })
    nodes.forEach(n => { if (by==='height') n.style.minHeight = `${Math.ceil(max)}px`; else n.style.minWidth = `${Math.ceil(max)}px` })
  },
  unmounted(el: HTMLElement){ (el as any)._eqCleanup?.() }
}
</script>

<style scoped>
/* Header container: mobile scroll, md+ grid */
.tabs-header {
  display: flex;
  gap: 1rem;           /* gap-4 */
  overflow-x: auto;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x proximity;
  padding: .25rem;     /* p-1 */
}
@media (min-width: 768px) {
  .tabs-header {
    display: grid;
    gap: 1rem;
    /* پیش‌فرض 4 ستون؛ با CSS variable قابل تغییر از بیرون */
    grid-template-columns: repeat(var(--tabs-md-cols, 4), minmax(0, 1fr));
    overflow: visible;
  }
}

.tab-btn {
  scroll-snap-align: center;
  border-radius: .75rem; /* rounded-xl */
  padding: .75rem 1rem;  /* py-3 px-4 */
  font-weight: 700;      /* font-bold */
  line-height: 1.5rem;
  background: white;
  color: var(--c-primary, #0f172a);
  box-shadow: 0 1px 2px rgba(0,0,0,.05);
  min-width: 8rem;
  display: flex; align-items: center; justify-content: center; text-align: center;
  white-space: normal; word-break: break-word; /* multiline titles */
  border: 2px solid transparent;
}
.tab-btn.is-active { background: var(--c-primary, #0f172a); color: white; }
.tab-btn.is-disabled { opacity: .5; cursor: not-allowed; }

.tab-panel { margin-top: 1rem; }
</style>

<!-- Usage (نمونه سریع)
<template>
  <TabsUnified
    :tabs="[
      { label:'اطلاعات', component: InfoPane },
      { label:'بررسی احراز هویت', component: StoreAuth, props:{ id: route.params.id } },
      { label:'سبدهای خرید', component: StoreCarts, props:{ id: route.params.id } },
      { label:'باشگاه مشتریان', component: StoreCustomers, props:{ id: route.params.id } },
      { label:'کیف پول', component: StoreCredit },
      { label:'گزارش‌ها', component: StoreReports, props:{ url: data.url } },
      { label:'تیکت‌های پشتیبانی', component: TicketBox },
      { label:'شماره‌گیر', component: StoreHardware, props:{ id: route.params.id } },
    ]"
    query-sync
    query-key="tab"
    :keep-alive="true"
    dir="rtl"
    :style="{ '--tabs-md-cols': 4 }"  
  />
</template>
-->
