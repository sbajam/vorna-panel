<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <h1 class="text-xl font-bold mb-4">🧪 تست DashboardGrid</h1>

    <!-- تست DashboardGrid standalone -->
    <DashboardGrid
      v-if="rawConfigs.length"
      :widgets="rawConfigs"
      dashboard-id="demo-dash"
      :cols="{ lg: 12 }"
      :row-height="30"
      :margin="[12, 12]"
    />
  </div>
</template>

<script setup>
import { mockData } from "~/mock/mockData.js";

// ۱. آرایه‌ی اصلی کانفیگ ویجت‌ها (بدون id و dataSources)
const rawConfigs = ref([
  {
    id:'w-1',dataSources: mockData,
    type: "list",
    title: "محصولات در آستانه اتمام موجودی",
    from: "products",
    transform: ({ products }) => products,
    filter: (p) => p.stock < 10,
    renderItem: (p) => `${p.name} ${p.stock} عدد`,
    getLink: (p) => `/products/${p.id}/edit`,
    limit: 10,
  },
  {
    id:'w-2',dataSources: mockData,
    type: "stat",
    title: "سفارش‌های در انتظار",
    from: ["orders"],
    filter: (o) => o.status === "pending",
    compute: (items) => items.length,
    subtitle: "سفارش‌های تکمیل‌نشده",
  },
  {
    id:'w-3',dataSources: mockData,
    type: "chart",
    title: "ثبت‌نام کاربران ماهانه",
    chartType: "line",
    from: ["users"],
    transform: ({ users }) => {
      const map = {};
      users.forEach((u) => {
        const m = u.createdAt.slice(0, 7);
        map[m] = (map[m] || 0) + 1;
      });
      const data = Object.entries(map)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([x, y]) => ({ x, y }));
      return {
        series: [{ name: "ثبت‌نام", data }],
        chartOptions: {
          chart: { type: "line" },
          xaxis: { type: "category", categories: data.map((d) => d.x) },
          colors: ["#1E3A8A"],
          legend: { position: "bottom" },
        },
      };
    },
  },
]);

// ۲. الحاق id و dataSources به هر config
// const widgetsWithData = computed(() =>
//   rawConfigs.map((cfg, i) => ({
//     ...cfg,
//     id: cfg.id || `w-${i}`, // یک id یکتا
//     dataSources: mockData,
//   }))
// );
</script>
