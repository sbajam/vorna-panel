<template>
  <div class="p-6 bg-gray-50 min-h-screen space-y-6">
    <h1 class="text-xl font-bold">🧪 تست DashboardWidget</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <DashboardWidget
        v-for="(config, i) in widgetConfigs"
        :key="i"
        :config="config"
        :dataSources="mockData"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { mockData } from "../../mock/mockData.js";

const widgetConfigs = ref([
  {
    type: "list",
    title: "محصولات در آستانه اتمام موجودی",
    from: "products",
    transform: ({ products }) => products, // صرفاً داده‌ها را ارسال می‌کنیم
    filter: (product) => product.stock < 100,
    renderItem: (product) => `${product.name} ${product.stock} عدد`,
    getLink: (product) => `/products/${product.id}/edit`, // یا هر URL دلخواه
    limit: 10,
  },

  {
    type: "stat",
    title: "محصولات کم‌موجودی",
    from: ["products"],
    filter: (product) => product.stock < 5,
    compute: (items) => items.length,
    subtitle: "تعداد محصولاتی که موجودی‌شان کمتر از ۵ است",
    link: "/products/low-stock",
  },

  // 10B. مجموع درآمد کل
  {
    type: "stat",
    title: "مجموع درآمد",
    from: ["orders"],
    // مجموع همهٔ قیمت‌ها در آیتم‌های سفارش
    compute: (orders) =>
      orders
        .reduce(
          (sum, o) =>
            sum + o.items.reduce((s, i) => s + i.quantity * i.price, 0),
          0
        )
        .toLocaleString("fa-IR") + " ریال",
    subtitle: "درآمد تجمعی از ابتدا",
    link: "/reports/revenue",
  },

  // 10C. تعداد سفارش‌های در انتظار (pending)
  {
    type: "stat",
    title: "سفارش‌های در انتظار",
    from: ["orders"],
    filter: (o) => o.status === "pending",
    compute: (items) => items.length,
    subtitle: "سفارش‌هایی که هنوز تکمیل نشده‌اند",
    link: "/orders?status=pending",
  },
  {
    type: "chart",
    title: "چگالی سفارشات برحسب روز و ساعت",
    chartType: "heatmap",
    from: ["orders"],
    transform: ({ orders }) => {
      // روزها و ساعت‌ها
      const buckets = {};
      orders.forEach((o) => {
        const d = new Date(o.createdAt);
        const day = d.getDay(); // 0=یکشنبه … 6=شنبه
        const hr = d.getHours(); // 0–23
        buckets[day] = buckets[day] || {};
        buckets[day][hr] = (buckets[day][hr] || 0) + 1;
      });

      const dayNames = [
        "یکشنبه",
        "دوشنبه",
        "سه‌شنبه",
        "چهارشنبه",
        "پنج‌شنبه",
        "جمعه",
        "شنبه",
      ];

      const series = Object.entries(buckets).map(([day, hours]) => ({
        name: dayNames[day],
        data: Object.entries(hours).map(([h, count]) => ({
          x: `${h}:00`,
          y: count,
        })),
      }));

      return {
        series,
        chartOptions: {
          chart: { type: "heatmap" },
          colors: ["#1E3A8A", "#DC2626"],
        },
      };
    },
  },
 {
  type: "chart",
  title: "درصد تحقق هدف فروش",
  chartType: "donut",
  from: ["orders"],
  transform: ({ orders }) => {
    const sold = orders.reduce(
      (sum, o) =>
        sum +
        o.items.reduce((s, i) => s + i.quantity * i.price, 0),
      0
    );
    const goal = 2_000_000_000;
    const pct = Math.min(100, Math.round((sold / goal) * 100));
    return [
      { label: "تحقق", value: pct },
      { label: "باقی‌مانده", value: 100 - pct },
    ];
  },
  // برای Pie:
  // - series = نام فیلدی که مقادیر عددی در آن ذخیره است
  // - y      = همان کلید عددی (برای generateSeriesFromXY)
  series: "label",
  y: "value"
},
  ///////////////////////////////////////////////
  // 1. Bar Chart: فروش ماهانه به تفکیک دسته‌بندی
  {
    type: "chart",
    title: "فروش ماهانه به تفکیک دسته‌بندی",
    chartType: "bar",
    from: ["orders", "products", "categories"],
    transform: ({ orders, products, categories }) => {
      const map = new Map();
      orders.forEach((o) => {
        const month = o.createdAt.slice(0, 7); // YYYY-MM
        o.items.forEach((item) => {
          const prod = products.find((p) => p.id === item.productId);
          const cat = categories.find((c) => c.id === prod.categoryId);
          const key = `${cat.name}|${month}`;
          map.set(key, (map.get(key) || 0) + item.quantity * item.price);
        });
      });
      // دسته‌بندی‌ها
      const cats = [...new Set([...map.keys()].map((k) => k.split("|")[0]))];
      // ماه‌ها
      const months = [
        ...new Set([...map.keys()].map((k) => k.split("|")[1])),
      ].sort();
      const series = cats.map((catName) => ({
        name: catName,
        data: months.map((m) => ({ x: m, y: map.get(`${catName}|${m}`) || 0 })),
      }));
      return {
        series,
        chartOptions: {
          chart: { type: "bar" },
          colors: ["#1E3A8A", "#DC2626"],
          xaxis: { type: "category", categories: months },
          legend: { position: "bottom" },
        },
      };
    },
  },

  // 2. Line Chart: ثبت‌نام کاربران در طول زمان
  {
    type: "chart",
    title: "ثبت‌نام کاربران در طول زمان",
    chartType: "line",
    from: ["users"],
    transform: ({ users }) => {
      const counts = {};
      users.forEach((u) => {
        const m = u.createdAt.slice(0, 7);
        counts[m] = (counts[m] || 0) + 1;
      });
      const data = Object.entries(counts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([x, y]) => ({ x, y }));
      return {
        series: [{ name: "ثبت‌نام", data }],
        chartOptions: {
          chart: { type: "line" },
          colors: ["#1E3A8A", "#DC2626"],
          xaxis: { type: "category", categories: data.map((d) => d.x) },
          legend: { position: "bottom" },
        },
      };
    },
  },

  // 3. Area Chart: تجمعی فروش
  {
    type: "chart",
    title: "تجمعی فروش تا امروز",
    chartType: "area",
    from: ["orders"],
    transform: ({ orders }) => {
      const arr = orders
        .map((o) => ({
          date: o.createdAt,
          total: o.items.reduce((s, i) => s + i.quantity * i.price, 0),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
      let cum = 0;
      const data = arr.map((o) => {
        cum += o.total;
        return { x: o.date, y: cum };
      });
      return {
        series: [{ name: "فروش تجمعی", data }],
        chartOptions: {
          chart: { type: "area" },
          colors: ["#1E3A8A", "#DC2626"],
          xaxis: { type: "category", categories: data.map((d) => d.x) },
          legend: { position: "bottom" },
        },
      };
    },
  },

  // 4. Pie Chart: سهم دسته‌ها در کل سفارشات
  {
    type: "chart",
    title: "سهم دسته‌بندی‌ها در سفارشات",
    chartType: "pie",
    from: ["orders", "products", "categories"],
    transform: ({ orders, products, categories }) => {
      const map = new Map();
      orders.forEach((o) => {
        o.items.forEach((item) => {
          const prod = products.find((p) => p.id === item.productId);
          const cat = categories.find((c) => c.id === prod.categoryId);
          map.set(cat.name, (map.get(cat.name) || 0) + item.quantity);
        });
      });
      return [...map.entries()].map(([label, total]) => ({
        category: label,
        total,
      }));
    },
    series: "category",
    y: "total",
  },

  // 5. Scatter Plot: تعداد آیتم‌ها در مقابل مبلغ کل سفارش
  {
    type: "chart",
    title: "تعداد آیتم‌ها vs مبلغ کل سفارش",
    chartType: "scatter",
    from: ["orders"],
    transform: ({ orders }) => {
      return orders.map((o) => {
        const qty = o.items.reduce((s, i) => s + i.quantity, 0);
        const total = o.items.reduce((s, i) => s + i.quantity * i.price, 0);
        return { orderId: o.id, qty, total };
      });
    },
    x: "qty",
    y: "total",
    series: "orderId",
  },

  // 8. Radar Chart: مثال مقایسه چند KPI فرضی
  {
    type: "chart",
    title: "مقایسه شاخص‌های KPI",
    chartType: "radar",
    from: [],
    transform: () => {
      const metrics = [
        { x: "کیفیت", y: 80 },
        { x: "پشتیبانی", y: 65 },
        { x: "سرعت", y: 75 },
        { x: "قابلیت اطمینان", y: 90 },
        { x: "قیمت", y: 70 },
      ];
      return {
        series: [{ name: "نمره KPI", data: metrics }],
        chartOptions: {
          chart: { type: "radar" },
          colors: ["#1E3A8A", "#DC2626"],
          legend: { position: "bottom" },
        },
      };
    },
  },
  //////////////////////////////

  // 9. Funnel Chart: مراحل خرید فرضی

  // 6. Gauge Chart: درصد تحقق هدف فروش (به‌صورت نسبت فروش فعلی به سقف فرضی)
]);
</script>
