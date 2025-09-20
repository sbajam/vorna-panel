<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box class="">
        <Header></Header>
        <!-- Toolbar: Filters/Search + Actions -->
        <div class="flex flex-wrap items-center gap-2"></div>

        <!-- Table -->
        <SmartTable
          class="smart-scroll"
          emptyText="موردی برای نمایش وجود ندارد."
          edit=""
          delete=""
          :data="filteredData"
          :columns="columns"
          :actions="actions"
          :loading="isLoading"
          :error="false"
          :sortable="true"
          :multiSort="false"
          :excel="false"
          :idShow="false"
          :stickyHeader="true"
          :responsive="true"
          :refresh="true"
          @refresh="fetchData"
          :rowClickable="false"
        />
      </Box>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { request } = useApi();
const { $notifyDanger } = useNuxtApp();

const NORMALIZATION = {
  enabled: true,
  includePaths: null,
  excludePaths: [],
  textOptions: {
    digits: "fa-to-en",
    letters: "ar-to-fa",
    removeTatweel: true,
    removeDiacritics: true,
    removeZWNJ: true,
    collapseSpaces: true,
    trim: true,
  },
};

// Data
const rawData = ref<any[]>([]);
const filteredData = ref<any[]>([]);
const isLoading = ref(true);

// Filters
// no searches
// no dropdowns

// Columns/Actions (SmartTable-ready)
const columns = ref([
  {
    key: "index",
    label: "#",
    type: "number",
    sortable: false,
    formatOptions: {
      maximumFractionDigits: 0,
    },
  },
  {
    key: "title",
    label: "نوع درخواست",
    type: "text",
    sortable: true,
    shrink: true,
  },
  {
    key: "text",
    label: "توضیحات",
    type: "text",
    sortable: true,
    shrink: true,
  },
  {
    key: "read",
    label: "وضعیت",
    type: "badge",
    sortable: true,
    map: {
      true: "رسیدگی شده",
      false: "درحال رسیدگی",
    },
  },
  {
    key: "date",
    label: "تاریخ",
    type: "datetime",
    sortable: true,
  },
]);
const actions = ref([]);

// Transform
function getByPath(obj: any, path?: string) {
  if (!path) return obj;
  return path
    .split(".")
    .reduce((o: any, k: string) => (o ? o[k] : undefined), obj);
}
const transformData = (item: any) => {
  return item;
};

// Filtering
const filterData = () => {
  let list = rawData.value.slice();
  // normalization (display)
  if (NORMALIZATION.enabled) {
    list = list.map((row: any) => normalizeAll(row, NORMALIZATION));
  }

  // search(es)
  // no main search
  // no extra searches

  // dropdowns
  // no dropdowns

  filteredData.value = list.map(transformData);
};

// Fetch
const API_CONFIG = {
  baseUrl: "https://api.vendow.ir",
  path: "mystore/serviceqequest",
  pathToList: "data",
  method: "GET",
  headers: {},
};
const fetchData = async () => {
  isLoading.value = true;
  try {
    if (!API_CONFIG) {
      rawData.value = [];
      filterData();
      return;
    }
    const res = await request(API_CONFIG.path, {
      baseUrl: API_CONFIG.baseUrl,
      method: API_CONFIG.method,
      headers: { "Cache-Control": "no-cache", ...API_CONFIG.headers },
      body: API_CONFIG.method !== "GET" ? API_CONFIG.body : undefined,
    });
    if (!res?.status) {
      $notifyDanger(res?.message || "خطا در دریافت اطلاعات");
      rawData.value = [];
    } else {
      const list = getByPath(res, API_CONFIG.pathToList) ?? res?.body ?? [];
      rawData.value = Array.isArray(list) ? list : [];
    }
    filterData();
  } catch (e) {
    $notifyDanger("مشکلی پیش آمد.");
    rawData.value = [];
    filterData();
  } finally {
    isLoading.value = false;
  }
};

// Watch filters
watch([], filterData, { deep: true });

onBeforeMount(fetchData);
</script>
