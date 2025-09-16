<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box class="">
        <Header>سبدهای خرید</Header>
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
          <DropDown
            label="وضعیت"
            :items="statusOptions"
            v-model="status"
            class="!p-0"
          />
        </div>

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
          :excel="true"
          :excelOptions="{
            filename: 'export.xlsx',
            useRawData: false,
            columns: null,
          }"
          :idShow="false"
          :stickyHeader="true"
          :responsive="true"
          :refresh="true"
          @refresh="fetchData"
          :rowClickable="false"
          @view="
            (e) => {
              popup = true;
              modalRow = e;
            }
          "
        />
        <CartDetailP
          v-if="popup"
          :show="popup"
          :data="filteredData"
          :modal-row="modalRow"
          @close_popup="popup = false"
        />
      </Box>
    </template>
  </NuxtLayout>
</template>

<script setup>
const { request } = useApi();
const { $notifyDanger } = useNuxtApp();

// Data
const rawData = ref([]);
const filteredData = ref([]);
const isLoading = ref(true);

// Filters
const searchTerm = ref("");

const status = ref("همه");
const statusOptions = ref([
  "همه",
  "در انتظار پرداخت",
  "پرداخت نشده",
  "در حال آماده سازی",
  "ارسال شده",
  "لغو شده توسط مشتری",
]);
const normalizer = createNormalizer({
  excludePaths: ["*.city", "*.address"], // ⬅️ همین دو تا دست‌نخورده می‌مونن
  textOptions: {
    digits: "fa-to-en",
    letters: "ar-to-fa",
    removeTatweel: true,
    removeDiacritics: true,
    removeZWNJ: false,
    collapseSpaces: true,
    trim: true,
  },
});
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
    key: "name",
    label: "نام",
    type: "text",
    sortable: true,
  },
  {
    key: "phone_number",
    label: "شماره تماس",
    type: "text",
    sortable: true,
  },
  {
    key: "city",
    label: "شهر",
    type: "text",
    sortable: true,
  },
  {
    key: "postal_code",
    label: "کد پستی",
    type: "text",
    sortable: true,
  },
  {
    key: "address",
    label: "آدرس",
    type: "text",
    sortable: true,
    shrink: true,
  },
  {
    key: "tracking_code",
    label: "کد پیگیری",
    type: "text",
    sortable: true,
  },
  {
    key: "date",
    label: "تاریخ",
    type: "date",
    sortable: true,
  },
  {
    key: "status",
    label: "وضعیت",
    type: "badge",
    sortable: true,
    map: {
      true: "بله",
      false: "خیر",
    },
  },
]);
const actions = ref([
  {
    icon: "fa6-solid:crosshairs",
    tooltip: "مشاهده جزییات",
    emit: "view",
  },
]);

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

  // search(es)
  {
    const q = String(searchTerm.value || "")
      .toLowerCase()
      .trim();
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
  {
    const opts = [
      { label: "همه", value: "all" },
      { label: "در انتظار پرداخت", value: "در انتظار پرداخت" },
      { label: "پرداخت نشده", value: "پرداخت نشده" },
      { label: "در حال آماده سازی", value: "در حال آماده سازی" },
      { label: "ارسال شده", value: "ارسال شده" },
      { label: "لغو شده توسط مشتری", value: "لغو شده توسط مشتری" },
    ];
    const found = opts.find((o) => o.label === status.value);
    const val = found ? found.value : status.value;
    if (
      "status" &&
      !(
        val === undefined ||
        val === null ||
        val === "" ||
        val === "all" ||
        val === "همه"
      )
    ) {
      list = list.filter(
        (row) => String(getByPath(row, "status")) === String(val)
      );
    }
  }

  filteredData.value = list.map(transformData);
};

// Fetch
const API_CONFIG = {
  baseUrl: "https://api.vendow.ir",
  path: "mystore/shopping_cart",
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
      rawData.value = Array.isArray(list)
        ? list.map((item) => normalizer.all(item)) // ⬅️ همه‌جا نرمال بجز city/address
        : [];
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
watch([searchTerm, status], filterData, { deep: true });

onBeforeMount(fetchData);
</script>
