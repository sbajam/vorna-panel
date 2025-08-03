<template>
  <NuxtLayout name="admin">
    <template #main>
      <div class="space-y-8 w-full">
        <AddFavP
          :show="showFavoriteModal"
          @close_popup="showFavoriteModal = false"
          @submit-form="addFavorite"
          :isGet="isGetFav"
        />
        <!-- Header Row with Dashboard Switcher and Favorites -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <!-- DashboardSwitcher handles selecting and creating dashboards -->
          <DashboardSwitcher
            class="md:col-span-3"
            :dashboards="dashboards"
            @select="onSelect"
            @create="onCreateDashboard"
          />

          <!-- DashboardFavorites shows pinned links to external pages -->
          <DashboardFavorites
            class="md:col-span-2"
            :favorites="favorites"
            @select="onFavoriteSelect"
            @remove="onFavoriteRemove"
            @add="openFavoriteModal"
          />
        </div>

        <!-- Main Dashboard View -->
        <!-- <DashboardView
          v-if="selected"
          :dashboard-id="selected.id"
          :title="selected.name"
          :widgets-with-data="selected.widgets"
          @pin="onPin"
          @settings="() => log.unshift('⚙️ Settings clicked')"
          @delete="onDeleteDashboard"
        /> -->
        <Box>
        <DashboardGrid
          v-if="selected.widgets.length"
          :widgets="selected.widgets"
          :dashboard-id="selected.id"
          :cols="{ lg: 12 }"
          :row-height="30"
          :margin="[12, 12]"
        />
        </Box>
      </div>
    </template>
  </NuxtLayout>
</template>

<script setup>
import { mockData } from "~/mock/mockData.js";
// Import all predefined widget configurations

// Dashboard list with assigned widget indexes
// const dashboards = ref([
//   {
//     id: "d1",
//     name: "Design",
//     icon: "ph:paint-brush",
//     widgets: [
//       {
//         id: 1,
//         dataSources: mockData,
//         type: "list",
//         title: "محصولات در آستانه اتمام موجودی",
//         from: "products",
//         transform: ({ products }) => products, // صرفاً داده‌ها را ارسال می‌کنیم
//         filter: (product) => product.stock < 100,
//         renderItem: (product) => `${product.name} ${product.stock} عدد`,
//         getLink: (product) => `/products/${product.id}/edit`, // یا هر URL دلخواه
//         limit: 10,
//       },
//       {
//         id: 2,
//         dataSources: mockData,
//         type: "stat",
//         title: "مجموع درآمد",
//         from: ["orders"],
//         // مجموع همهٔ قیمت‌ها در آیتم‌های سفارش
//         compute: (orders) =>
//           orders
//             .reduce(
//               (sum, o) =>
//                 sum + o.items.reduce((s, i) => s + i.quantity * i.price, 0),
//               0
//             )
//             .toLocaleString("fa-IR") + " ریال",
//         subtitle: "درآمد تجمعی از ابتدا",
//         link: "/reports/revenue",
//       },
//       {
//         id: 3,
//         dataSources: mockData,
//         type: "chart",
//         title: "درصد تحقق هدف فروش",
//         chartType: "donut",
//         from: ["orders"],
//         transform: ({ orders }) => {
//           const sold = orders.reduce(
//             (sum, o) =>
//               sum + o.items.reduce((s, i) => s + i.quantity * i.price, 0),
//             0
//           );
//           const goal = 2_000_000_000;
//           const pct = Math.min(100, Math.round((sold / goal) * 100));
//           return [
//             { label: "تحقق", value: pct },
//             { label: "باقی‌مانده", value: 100 - pct },
//           ];
//         },
//         // برای Pie:
//         // - series = نام فیلدی که مقادیر عددی در آن ذخیره است
//         // - y      = همان کلید عددی (برای generateSeriesFromXY)
//         series: "label",
//         y: "value",
//       },
//     ],
//   },
//   {
//     id: "d2",
//     name: "Sales",
//     icon: "mdi:chart-line",
//     widgets: [
//       {
//         id: 4,
//         dataSources: mockData,
//         type: "stat",
//         title: "محصولات کم‌موجودی",
//         from: ["products"],
//         filter: (product) => product.stock < 5,
//         compute: (items) => items.length,
//         subtitle: "تعداد محصولاتی که موجودی‌شان کمتر از ۵ است",
//         link: "/products/low-stock",
//       },
//       {
//         id: 5,
//         dataSources: mockData,
//         type: "stat",
//         title: "سفارش‌های در انتظار",
//         from: ["orders"],
//         filter: (o) => o.status === "pending",
//         compute: (items) => items.length,
//         subtitle: "سفارش‌هایی که هنوز تکمیل نشده‌اند",
//         link: "/orders?status=pending",
//       },
//       {
//         id: 6,
//         dataSources: mockData,
//         type: "chart",
//         title: "فروش ماهانه به تفکیک دسته‌بندی",
//         chartType: "bar",
//         from: ["orders", "products", "categories"],
//         transform: ({ orders, products, categories }) => {
//           const map = new Map();
//           orders.forEach((o) => {
//             const month = o.createdAt.slice(0, 7); // YYYY-MM
//             o.items.forEach((item) => {
//               const prod = products.find((p) => p.id === item.productId);
//               const cat = categories.find((c) => c.id === prod.categoryId);
//               const key = `${cat.name}|${month}`;
//               map.set(key, (map.get(key) || 0) + item.quantity * item.price);
//             });
//           });
//           // دسته‌بندی‌ها
//           const cats = [
//             ...new Set([...map.keys()].map((k) => k.split("|")[0])),
//           ];
//           // ماه‌ها
//           const months = [
//             ...new Set([...map.keys()].map((k) => k.split("|")[1])),
//           ].sort();
//           const series = cats.map((catName) => ({
//             name: catName,
//             data: months.map((m) => ({
//               x: m,
//               y: map.get(`${catName}|${m}`) || 0,
//             })),
//           }));
//           return {
//             series,
//             chartOptions: {
//               chart: { type: "bar" },
//               colors: ["#1E3A8A", "#DC2626"],
//               xaxis: { type: "category", categories: months },
//               legend: { position: "bottom" },
//             },
//           };
//         },
//       },
//     ],
//   },
//   {
//     id: "d3",
//     name: "Marketing",
//     icon: "mdi:bullhorn-outline",
//     widgets: [
//       {
//         id: 7,
//         dataSources: mockData,
//         type: "chart",
//         title: "چگالی سفارشات برحسب روز و ساعت",
//         chartType: "heatmap",
//         from: ["orders"],
//         transform: ({ orders }) => {
//           // روزها و ساعت‌ها
//           const buckets = {};
//           orders.forEach((o) => {
//             const d = new Date(o.createdAt);
//             const day = d.getDay(); // 0=یکشنبه … 6=شنبه
//             const hr = d.getHours(); // 0–23
//             buckets[day] = buckets[day] || {};
//             buckets[day][hr] = (buckets[day][hr] || 0) + 1;
//           });

//           const dayNames = [
//             "یکشنبه",
//             "دوشنبه",
//             "سه‌شنبه",
//             "چهارشنبه",
//             "پنج‌شنبه",
//             "جمعه",
//             "شنبه",
//           ];

//           const series = Object.entries(buckets).map(([day, hours]) => ({
//             name: dayNames[day],
//             data: Object.entries(hours).map(([h, count]) => ({
//               x: `${h}:00`,
//               y: count,
//             })),
//           }));

//           return {
//             series,
//             chartOptions: {
//               chart: { type: "heatmap" },
//               colors: ["#1E3A8A", "#DC2626"],
//             },
//           };
//         },
//       },
//       {
//         id: 8,
//         dataSources: mockData,
//         type: "chart",
//         title: "فروش ماهانه به تفکیک دسته‌بندی",
//         chartType: "bar",
//         from: ["orders", "products", "categories"],
//         transform: ({ orders, products, categories }) => {
//           const map = new Map();
//           orders.forEach((o) => {
//             const month = o.createdAt.slice(0, 7); // YYYY-MM
//             o.items.forEach((item) => {
//               const prod = products.find((p) => p.id === item.productId);
//               const cat = categories.find((c) => c.id === prod.categoryId);
//               const key = `${cat.name}|${month}`;
//               map.set(key, (map.get(key) || 0) + item.quantity * item.price);
//             });
//           });
//           // دسته‌بندی‌ها
//           const cats = [
//             ...new Set([...map.keys()].map((k) => k.split("|")[0])),
//           ];
//           // ماه‌ها
//           const months = [
//             ...new Set([...map.keys()].map((k) => k.split("|")[1])),
//           ].sort();
//           const series = cats.map((catName) => ({
//             name: catName,
//             data: months.map((m) => ({
//               x: m,
//               y: map.get(`${catName}|${m}`) || 0,
//             })),
//           }));
//           return {
//             series,
//             chartOptions: {
//               chart: { type: "bar" },
//               colors: ["#1E3A8A", "#DC2626"],
//               xaxis: { type: "category", categories: months },
//               legend: { position: "bottom" },
//             },
//           };
//         },
//       },
//       {
//         id: 9,
//         dataSources: mockData,
//         type: "chart",
//         title: "تجمعی فروش تا امروز",
//         chartType: "area",
//         from: ["orders"],
//         transform: ({ orders }) => {
//           const arr = orders
//             .map((o) => ({
//               date: o.createdAt,
//               total: o.items.reduce((s, i) => s + i.quantity * i.price, 0),
//             }))
//             .sort((a, b) => a.date.localeCompare(b.date));
//           let cum = 0;
//           const data = arr.map((o) => {
//             cum += o.total;
//             return { x: o.date, y: cum };
//           });
//           return {
//             series: [{ name: "فروش تجمعی", data }],
//             chartOptions: {
//               chart: { type: "area" },
//               colors: ["#1E3A8A", "#DC2626"],
//               xaxis: { type: "category", categories: data.map((d) => d.x) },
//               legend: { position: "bottom" },
//             },
//           };
//         },
//       },
//     ],
//   },
//   {
//     id: "d4",
//     name: "Product",
//     icon: "mdi:package-variant",
//     widgets: [
//       {
//         id: 10,
//         dataSources: mockData,
//         type: "chart",
//         title: "سهم دسته‌بندی‌ها در سفارشات",
//         chartType: "pie",
//         from: ["orders", "products", "categories"],
//         transform: ({ orders, products, categories }) => {
//           const map = new Map();
//           orders.forEach((o) => {
//             o.items.forEach((item) => {
//               const prod = products.find((p) => p.id === item.productId);
//               const cat = categories.find((c) => c.id === prod.categoryId);
//               map.set(cat.name, (map.get(cat.name) || 0) + item.quantity);
//             });
//           });
//           return [...map.entries()].map(([label, total]) => ({
//             category: label,
//             total,
//           }));
//         },
//         series: "category",
//         y: "total",
//       },
//       {
//         id: 11,
//         dataSources: mockData,
//         type: "chart",
//         title: "تعداد آیتم‌ها vs مبلغ کل سفارش",
//         chartType: "scatter",
//         from: ["orders"],
//         transform: ({ orders }) => {
//           return orders.map((o) => {
//             const qty = o.items.reduce((s, i) => s + i.quantity, 0);
//             const total = o.items.reduce((s, i) => s + i.quantity * i.price, 0);
//             return { orderId: o.id, qty, total };
//           });
//         },
//         x: "qty",
//         y: "total",
//         series: "orderId",
//       },
//       {
//         id: 12,
//         dataSources: mockData,
//         type: "chart",
//         title: "مقایسه شاخص‌های KPI",
//         chartType: "radar",
//         from: [],
//         transform: () => {
//           const metrics = [
//             { x: "کیفیت", y: 80 },
//             { x: "پشتیبانی", y: 65 },
//             { x: "سرعت", y: 75 },
//             { x: "قابلیت اطمینان", y: 90 },
//             { x: "قیمت", y: 70 },
//           ];
//           return {
//             series: [{ name: "نمره KPI", data: metrics }],
//             chartOptions: {
//               chart: { type: "radar" },
//               colors: ["#1E3A8A", "#DC2626"],
//               legend: { position: "bottom" },
//             },
//           };
//         },
//       },
//     ],
//   },
// ]);

// Favorite items linking to external routes
const favorites = ref([
  {
    id: "form-builder",
    name: "Form Builder",
    icon: "mdi:form-select",
    to: "/formBuilder",
  },
  {
    id: "logs",
    name: "Activity Logs",
    icon: "mdi:clipboard-text-clock-outline",
    to: "/logs",
  },
  {
    id: "errors-log",
    name: "Error Logs",
    icon: "mdi:bug-outline",
    to: "/errorsLog",
  },
]);

// Currently selected dashboard
const selected = ref(dashboards.value[0]);

// Modal visibility state for adding a favorite
const showFavoriteModal = ref(false);

// Simple activity logger
const log = ref([]);
let isGetFav = ref(false);
// Selects a dashboard from the switcher
function onSelect(d) {
  selected.value = d;
  log.value.unshift(`✅ Selected: ${d.name}`);
}

// Creates a new dashboard with unique ID and no widgets
function onCreateDashboard() {
  // TODO: persist new dashboard to backend or Pinia
  const id = `d${dashboards.value.length + 1}`;
  dashboards.value.push({
    id,
    name: `New ${id}`,
    icon: "mdi:plus-circle-outline",
    widgets: [],
  });
  log.value.unshift("➕ New dashboard created");
}

// Deletes the currently selected dashboard
function onDeleteDashboard() {
  dashboards.value = dashboards.value.filter(
    (d) => d.id !== selected.value?.id
  );
  selected.value = dashboards.value[0] || null;
  log.value.unshift("🗑️ Dashboard deleted");
}

// Moves selected dashboard to top (pinned behavior)
function onPin() {
  // TODO:
  const index = dashboards.value.findIndex((d) => d.id === selected.value?.id);
  if (index > 0) {
    const [pinned] = dashboards.value.splice(index, 1);
    dashboards.value.unshift(pinned);
    selected.value = pinned;
    log.value.unshift("📌 Pinned to top");
  }
}

// Handles favorite selection
function onFavoriteSelect(item) {
  log.value.unshift(`⭐ Favorite selected: ${item.name}`);
}

// Removes a favorite item
function onFavoriteRemove(item) {
  favorites.value = favorites.value.filter((f) => f.id !== item.id);
  log.value.unshift(`❌ Favorite removed: ${item.name}`);
}

// Opens modal to add a new favorite
function openFavoriteModal() {
  showFavoriteModal.value = true;
}

// Adds a favorite item from modal input
function addFavorite(newFav) {
  isGetFav.value = true;
  favorites.value.push(newFav);
  log.value.unshift(`⭐ Favorite added: ${newFav.name}`);
  showFavoriteModal.value = false;
  // TODO: persist favorite via API or Pinia
}
</script>
