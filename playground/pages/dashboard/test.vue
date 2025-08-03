<template>
  <div class="p-6 space-y-4">
    <h1 class="text-xl font-bold">🧪 تست DashboardSwitcher</h1>
<div class="grid grid-cols-3 gap-8">
    <DashboardSwitcher
    class="col-span-2"
      :dashboards="dashboards"
      @select="onSelect"
      @create="onCreate"
    />
    <DashboardFavorites
  :favorites="[
    { id: 'design', name: 'Design', icon: 'ph:paint-brush', to: '/dashboard/design' },
    { id: 'sales', name: 'Sales', icon: 'mdi:chart-line', to: '/dashboard/sales' }
  ]"
  @select="item => console.log('Selected favorite', item)"
  @remove="item => console.log('Removed', item)"
  @add="() => console.log('Add new favorite')"
/>


</div>
    <div class="mt-6 bg-white p-4 rounded shadow text-sm text-gray-600">
      <p>📌 داشبورد انتخاب‌شده: <strong>{{ selected?.name || '—' }}</strong></p>
      <p v-if="log.length">📝 لاگ رویدادها:</p>
      <ul class="list-disc list-inside">
        <li v-for="(entry, i) in log" :key="i">{{ entry }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const dashboards = ref([
  { id: 'd1', name: 'طراحی',icon:'fa-solid:lock'  },
  { id: 'd2', name: 'فروش', },
  { id: 'd3', name: 'Marketing',  },
  { id: 'd4', name: 'Product',  }
])

const selected = ref(null)
const log = ref([])

function onSelect(d) {
  selected.value = d
  log.value.unshift(`✅ انتخاب شد: ${d.name}`)
}

function onCreate() {
  const id = `d${dashboards.value.length + 1}`
  const newDash = { id, name: `جدید ${id}`, icon: '➕' }
  dashboards.value.push(newDash)
  log.value.unshift('➕ داشبورد جدید اضافه شد')
}
</script>
