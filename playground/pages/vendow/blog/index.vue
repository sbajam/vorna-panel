<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box class="">
        <Header>مقاله ها </Header>
        <!-- Toolbar: Filters/Search + Actions -->
        <div class="flex flex-wrap items-center gap-2">
          <div
            class="flex-nowrap w-full lg:w-6/12 flex items-center gap-0 relative justify-around"
          >
            <InputField
              v-model="searchTerm"
              placeholder="جستجو..."
              type="text"
              class="w-full !p-0"
            />
            <div
              class="absolute left-1 cursor-pointer top-1 bottom-1 text-xs lg:text-xl px-2 text-center flex items-center justify-center bg-primary-100 text-white rounded-xl aspect-square hover:bg-primary-dark transition-colors"
            >
              <Icon name="fa6-solid:magnifying-glass" />
            </div>
          </div>
        </div>

        <!-- Table -->
        <SmartTable
          class="smart-scroll"
          emptyText="موردی برای نمایش وجود ندارد."
          edit="blog"
          delete="articles"
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

<script setup>
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
const rawData = ref([]);
const filteredData = ref([]);
const isLoading = ref(true);

// Filters
const searchTerm = ref("");

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
    label: "title",
    type: "text",
    sortable: true,
  },
]);
const actions = ref([]);

// Transform
function getByPath(obj, path) {
  if (!path) return obj;
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
}
const transformData = (item) => {
  return item;
};

// Filtering
const filterData = () => {
  let list = rawData.value.slice();
  // normalization (display)
  if (NORMALIZATION.enabled) {
    list = list.map((row) => normalizeAll(row, NORMALIZATION));
  }

  // search(es)
  {
    const q = makeSearchString(searchTerm.value, NORMALIZATION.textOptions);
    if (q) {
      const fields = [];
      if (fields.length) {
        list = list.filter((row) =>
          fields.some((f) =>
            String(getByPath(row, f) ?? "")
              .toLowerCase()
              .includes(q)
          )
        );
      } else {
        list = list.filter((row) =>
          JSON.stringify(row).toLowerCase().includes(q)
        );
      }
    }
  }
  // no extra searches

  // dropdowns
  // no dropdowns

  filteredData.value = list.map(transformData);
};

// Fetch
const API_CONFIG = {
  baseUrl: "https://api.vendow.ir",
  path: "mystore/articles",
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
watch([searchTerm], filterData, { deep: true });

onBeforeMount(fetchData);
</script>
