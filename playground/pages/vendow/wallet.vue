<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box class="">
        <Header>کیف پول</Header>
        <div
          class="flex flex-col md:flex-row items-center justify-between gap-4 mb-6"
        >
          <div  class="text-lg text-secondary-100 font-bold">
            موجودی فعلی کیف پول :
            {{ new Intl.NumberFormat("fa-IR").format(parseFloat(balance)) }}
            تومان
          </div>
          <Button
            color="secondary-100"
            rounded="xl"
            size="xl"
            @click="submit()"
          >
            درخواست تسویه حساب
          </Button>
        </div>
        <!-- Table -->
        <SmartTable
          class="smart-scroll"
          emptyText="موردی برای نمایش وجود ندارد."
          edit=""
          delete=""
          :data="filteredData"
          :columns="columns"
          :loading="pending"
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
        />
      </Box>
    </template>
  </NuxtLayout>
</template>

<script setup>
const { request, data, pending } = useApi();
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
    key: "amount",
    label: "amount",
    type: "currency",
    sortable: true,
    formatOptions: {
      maximumFractionDigits: 0,
    },
  },
  {
    key: "transactionType",
    label: "نوع تراکنش",
    type: "badge",
    sortable: true,
    map: {
      true: "افزایش",
      false: "کاهش",
    },
  },
  {
    key: "description",
    label: "توضیحات",
    type: "text",
    sortable: true,
  },
  {
    key: "createdAt",
    label: "تاریخ",
    type: "datetime",
    sortable: true,
  },
]);
const balance = ref(0);

// Transform
function getByPath(obj, path) {
  if (!path) return obj;
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
}
const transformData = (item) => {
  return { ...item, transactionType: item.transactionType == "DEPOSIT" };
};

// Filtering
const filterData = () => {
  let list = rawData.value.slice();
  // normalization (display)
  if (NORMALIZATION.enabled) {
    list = list.map((row) => normalizeAll(row, NORMALIZATION));
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
  path: "transactions",
  pathToList: "body.transactions",
};
const fetchData = async () => {
  try {
    if (!API_CONFIG) {
      rawData.value = [];
      filterData();
      return;
    }

    // دریافت همزمان تراکنش‌ها و موجودی کیف پول
    const [transactionsRes, walletRes] = await Promise.all([
      request(API_CONFIG.path, {}),
      request('wallet', {})
    ]);

    // بررسی و ذخیره تراکنش‌ها
    if (!transactionsRes?.status) {
      $notifyDanger(transactionsRes?.message || "خطا در دریافت اطلاعات تراکنش‌ها");
      rawData.value = [];
    } else {
      const list = getByPath(transactionsRes, API_CONFIG.pathToList) ?? transactionsRes?.body ?? [];
      rawData.value = Array.isArray(list) ? list : [];
    }

    // بررسی و ذخیره موجودی کیف پول
    if (walletRes?.status && walletRes?.body?.balance !== undefined) {
      balance.value = walletRes.body.balance;
    }

    filterData();
  } catch (e) {
    $notifyDanger("مشکلی پیش آمد.");
    rawData.value = [];
    filterData();
  }
};
const submit = async () => {
  let amount = parseInt(balance.value);
  await request("settlement", { method: "put", data: { amount } });
  if (data.value.status) {
    useNuxtApp().$notifySuccess(data.value.message);
    fetchData();
  } else useNuxtApp().$notifyDanger(data.value.message);
};
// Watch filters
watch([], filterData, { deep: true });

onBeforeMount(fetchData);
</script>
