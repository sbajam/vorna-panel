<script setup>
import WidgetHeader from "../widgets/WidgetHeader.vue";
import StatCard from "../widgets/StatCard.vue";
import RecordList from "../widgets/RecordList.vue";
import ChartWidget from "../widgets/ChartWidget.client.vue";
import { computed } from "vue";

const props = defineProps({
  config: Object,
  dataSources: Object,
});

// خروجی transform (مستقیماً سری و آپشن رو بده)
const normalizedOutput = computed(() => {
  if (props.config?.type !== "chart") return null;
  const raw = getRawData();
  const result = props.config?.transform?.(raw);
  if (!result) return null;

  // اگر خودش سری و چارت داد
  if (result.series && result.chartOptions) return result;

  // اگر فقط آرایه ساده بود (helper-style)
  if (Array.isArray(result)) {
    return generateSeriesFromXY(result, props.config);
  }

  return null;
});

// داده خام برای transform
function getRawData() {
  const from = props.config?.from;
  if (!from) return [];
  if (Array.isArray(from)) {
    return Object.fromEntries(from.map((k) => [k, props.dataSources[k] ?? []]));
  }
  if (typeof from === "string") {
    return props.dataSources[from] ?? [];
  }
  return [];
}
function getArrayData() {
  const raw = getRawData();
  // اگر مستقیم آرایه است، برگردان
  if (Array.isArray(raw)) return raw;
  // اگر شیء است، اولین key‌اش را باز کن
  const keys = Object.keys(raw);
  return keys.length ? raw[keys[0]] : [];
}
// component dynamic
const widgetComponent = computed(() => {
  switch (props.config?.type) {
    case "stat":
      return StatCard;
    case "list":
      return RecordList;
    default:
      return null;
  }
});

// حالت آماده بودن
const isReady = computed(() => {
  if (props.config?.type === "chart") {
    return normalizedOutput.value?.series?.length > 0;
  }
  const from = props.config?.from;
  if (Array.isArray(from)) {
    return from.every((key) => Array.isArray(props.dataSources[key]));
  }
  if (typeof from === "string") {
    return Array.isArray(props.dataSources[from]);
  }
  return false;
});

// helper: ساخت سری از x/y/series config
function generateSeriesFromXY(data, config) {
  const { x, y, series, chartType } = config;
  const isPie = chartType === "pie" || chartType === "donut";

  if (isPie && series && y) {
    return {
      series: data.map((item) => Number(item[y])).filter((n) => !isNaN(n)),
      chartOptions: {
        chart: { type: chartType },
        labels: data.map((item) => item[series]),
        legend: { position: "bottom" },
      },
    };
  }

  if (!x || !y) return { series: [], chartOptions: {} };

  if (series) {
    const map = new Map();
    for (const item of data) {
      const name = item[series];
      const xVal = item[x];
      const yVal = item[y];
      if (!name || xVal == null || yVal == null) continue;
      if (!map.has(name)) map.set(name, []);
      map.get(name).push({ x: xVal, y: yVal });
    }
    return {
      series: [...map.entries()].map(([name, data]) => ({ name, data })),
      chartOptions: {
        chart: { type: chartType },
        xaxis: { type: "category" },
        legend: { position: "bottom" },
      },
    };
  } else {
    return {
      series: [
        {
          name: config.title || "Series",
          data: data.map((item) => ({ x: item[x], y: item[y] })),
        },
      ],
      chartOptions: {
        chart: { type: chartType },
        xaxis: { type: "category" },
        legend: { position: "bottom" },
      },
    };
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow p-4 flex flex-col gap-3">
    <WidgetHeader :title="props.config.title" />

    <!-- stat / list -->
    <component
       v-if="isReady && widgetComponent && props.config.type !== 'chart'"
       :is="widgetComponent"
       :config="props.config"
       :dataSources="getArrayData()"
     />

    <!-- chart -->
    <ChartWidget
      v-else-if="isReady && props.config.type === 'chart'"
      :type="props.config.chartType"
      :series="normalizedOutput?.series"
      :options="normalizedOutput?.chartOptions"
    />

    <!-- loading -->
    <div v-else class="text-sm text-gray-400">
      ⏳ در حال بارگذاری داده‌ها...
    </div>
  </div>
</template>
