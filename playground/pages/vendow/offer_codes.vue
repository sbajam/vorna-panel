<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box class="">
        <Header class=""> ایجاد کد تخفیف </Header>
        <!-- <DatePicker v-model="test" format="YYYY-MM-DD" mode="single" /> -->
        <FormBuilder
          ref="formRef"
          :config="formConfig"
          @submitForm="onSubmitForm"
        />
      </Box>
      <Box class="">
        <Header>کد تخفیف ها</Header>
        <!-- Toolbar: Filters/Search + Actions -->
        <div class="flex flex-wrap items-center gap-2"></div>

        <!-- Table -->
        <SmartTable
          class="smart-scroll"
          emptyText="موردی برای نمایش وجود ندارد."
          edit=""
          delete="offer_codes"
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
const { request, data, pending } = useApi();
const { $notifyDanger } = useNuxtApp();
const formRef = ref(null);

const NORMALIZATION = {
  enabled: true,
  includePaths: null,
  excludePaths: ["code"],
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
    key: "code",
    label: "کد",
    type: "text",
    sortable: true,
  },
  {
    key: "percent",
    label: "درصد تخفیف",
    type: "number",
    sortable: true,
    formatOptions: {
      maximumFractionDigits: 0,
    },
  },
  {
    key: "endDate",
    label: "تاریخ انقضا",
    type: "date",
    sortable: true,
  },
  {
    key: "purchasesNumber",
    label: "تعداد بار مجاز استفاده",
    type: "number",
    sortable: true,
    formatOptions: {
      maximumFractionDigits: 0,
    },
  },
  {
    key: "used",
    label: "تعداد بار استفاده شده",
    type: "number",
    sortable: true,
    formatOptions: {
      maximumFractionDigits: 0,
    },
  },
]);
const actions = ref([]);
const formConfig = reactive({
  formProps: {
    title: "",
    columns: {
      base: 1,
      md: 2,
    },
    disabledAll: false,
    loading: false,
    loadingMode: "skeleton",
    showErrorsAs: "inline",
    validationMode: "onChange",
  },
  sections: [
    {
      title: "",
      collapsible: true,
      _open: true,
      fields: [
        {
          key: "code",
          type: "text",
          label: "کد",
          placeholder: "مثلا vendow-offercode",
          required: true,
          layout: {
            colSpan: {
              base: 1,
              md: 1,
            },
          },
          tooltip: "به حروف کوچک و بزرگ و اعداد فارسی و انگلیسی حساس است",
          labelPosition: {
            base: "right",
          },
          validators: [
            {
              type: "required",
              message: "کد الزامی است",
            },
          ],
        },
        {
          key: "percent",
          type: "number",
          label: "درصد تخفیف",
          placeholder: "",
          required: true,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
              md: 1,
            },
          },
          tooltip: "",
          icon: "",
          direction: {
            base: "vertical",
          },

          labelPosition: {
            base: "right",
          },
          validators: [
            {
              type: "min",
              message: "درصد تخفیف باید بین صفر تا 100 باشد",
              value: 0,
            },
            {
              type: "max",
              message: "درصد تخفیف باید بین صفر تا 100 باشد",
              value: 100,
            },
            {
              type: "required",
              message: " درصد تخفیف الزامی است",
            },
          ],
        },
        {
          key: "purchasesNumber",
          type: "number",
          label: "تعداد بار استفاده",
          placeholder: "",
          required: true,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
              md: 1,
            },
          },
          tooltip: "",
          icon: "",
          direction: {
            base: "vertical",
          },

          labelPosition: {
            base: "right",
          },
          validators: [
            {
              type: "min",
              message: "تعداد بار استفاده باید بیشتر از 1 باشد",
              value: 1,
            },
            {
              type: "required",
              message: " تعداد بار استفاده ا الزامی است",
            },
          ],
        },
        {
          key: "endDate",
          type: "date",
          label: "تاریخ انقضا",
          placeholder: "",
          required: true,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
              md: 1,
            },
          },
          tooltip: "",
          icon: "",
          direction: {
            base: "vertical",
          },

          labelPosition: {
            base: "right",
          },
          validators: [
            {
              type: "required",
              message: "تاریخ انقضا الزامی است",
            },
          ],
          single: true,
          inputFormat: "YYYY/MM/DD",
          displayFormat: "YYYY/MM/DD",
        },
      ],
    },
  ],
  submitButton: {
    text: "ارسال",
    variant: "solid",
    color: "primary-100",
    pending: false,
  },
});
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
  // no main search
  // no extra searches

  // dropdowns
  // no dropdowns

  filteredData.value = list.map(transformData);
};

// Fetch
const API_CONFIG = {
  baseUrl: "https://api.vendow.ir",
  path: "mystore/offer_codes",
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
async function onSubmitForm(values) {
  formConfig.formProps.loading = true;
  await request("offer_codes", {
    method: "post",
    data: {
      code: values.code,
      percent: values.percent,
      endDate: values.endDate,
      purchasesNumber: values.purchasesNumber,
    },
  });
  if (data.value.status) {
    useNuxtApp().$notifySuccess(data.value.message);
    // Reset form values using the new resetForm method
    fetchData();
    if (formRef.value?.resetForm) formRef.value.resetForm();
  } else useNuxtApp().$notifyDanger(data.value.message);
  formConfig.formProps.loading = false;
}
</script>
