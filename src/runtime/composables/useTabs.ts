
// ──────────────────────────────────────────────────────────────────────────────
// File: src/runtime/composables/useTabs.ts
// Description: small helper to build `tabs` array + sync with route
// ──────────────────────────────────────────────────────────────────────────────
import { computed } from 'vue'
import { useRoute } from '#imports'

export interface UseTabsItem {
  key?: string | number
  label: string
  disabled?: boolean
  component?: any
  props?: Record<string, any>
}

export function useTabs<T extends UseTabsItem>(items: T[]) {
  const route = useRoute()
  const index = computed(() => {
    const raw = route.query.tab
    const i = Number(raw)
    return Number.isFinite(i) ? i : 0
  })
  const tabs = computed(() => items)
  return { tabs, index }
}


// ──────────────────────────────────────────────────────────────────────────────
// File: src/runtime/plugins/equalize.client.ts
// Description: register directive only on client
// ──────────────────────────────────────────────────────────────────────────────
import { defineNuxtPlugin } from '#imports'
import equalize from '~/runtime/directives/equalize'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('equalize', equalize as any)
})


// ──────────────────────────────────────────────────────────────────────────────
// File: module.ts (excerpt)
// Description: ensure component + plugin are exposed from the module
// ──────────────────────────────────────────────────────────────────────────────
import { defineNuxtModule, addComponentsDir, addPluginTemplate } from '@nuxt/kit'

export default defineNuxtModule({
  meta: { name: 'panel-tabs', configKey: 'panelTabs' },
  setup(_options, nuxt) {
    addComponentsDir({ path: resolve(nuxt.options.srcDir, 'src/runtime/components/ui/Tabs'), prefix: 'Panel' })

    addPluginTemplate({
      filename: 'panel/equalize.client.ts',
      src: resolve(nuxt.options.srcDir, 'src/runtime/plugins/equalize.client.ts')
    })
  }
})


// ──────────────────────────────────────────────────────────────────────────────
// Usage Example in a Page (playground/pages/stores/[id].vue)
// Shows how to migrate your current tabs with query syncing and responsive UI
// ──────────────────────────────────────────────────────────────────────────────
<script setup lang="ts">
import { useRoute } from '#imports'
import PanelTabs from '~/src/runtime/components/ui/Tabs/Tabs.vue'

const route = useRoute()

const tabs = [
  { key: 0, label: 'اطلاعات', component: defineAsyncComponent(() => import('~/components/store/Info.vue')) },
  { key: 1, label: 'بررسی احراز هویت', component: defineAsyncComponent(() => import('~/components/store/StoreAuth.vue')), props: { id: route.params.id } },
  { key: 2, label: 'سبدهای خرید', component: defineAsyncComponent(() => import('~/components/store/StoreCarts.vue')), props: { id: route.params.id } },
  { key: 3, label: 'باشگاه مشتریان', component: defineAsyncComponent(() => import('~/components/store/StoreCustomers.vue')), props: { id: route.params.id } },
  { key: 4, label: 'کیف پول', component: defineAsyncComponent(() => import('~/components/store/StoreCredit.vue')) },
  { key: 5, label: 'گزارش‌ها', component: defineAsyncComponent(() => import('~/components/store/StoreReports.vue')), props: (data) => ({ url: data?.url }) },
  { key: 6, label: 'تیکت‌های پشتیبانی', component: defineAsyncComponent(() => import('~/components/store/TicketBox.vue')) },
  { key: 7, label: 'شماره‌گیر', component: defineAsyncComponent(() => import('~/components/store/StoreHardware.vue')), props: { id: route.params.id } },
]
</script>

<template>
  <NuxtLayout name="default">
    <template #main>
      <div class="con mb-2 flex items-center justify-between gap-4">
        <h1 class="header">فروشگاه {{ /* data?.name */ '' }}</h1>
        <NuxtLink :to="`https://vendow.ir/${/* data?.url */ ''}`" class="border-b text-xl text-secondary border-secondary">
          vendow.ir/{{ /* data?.url */ '' }}
        </NuxtLink>
      </div>

      <!--
        Responsive behaviors:
        - mobile: horizontal scroll with snap
        - md+: grid with 4 columns (wraps to next row automatically)
        Equal height buttons handled by v-equalize directive
      -->
      <PanelTabs
        :tabs="tabs"
        query-sync
        query-key="tab"
        :keep-alive="true"
        dir="rtl"
        class="[&>.tabs-header]:md:grid-cols-4"  
      />
    </template>
  </NuxtLayout>
</template>

<style scoped>
/* Example of changing the grid columns count per breakpoint at usage site */
/* .tabs-header class is inside the component; we can target it with arbitrary selectors like above */
</style>
