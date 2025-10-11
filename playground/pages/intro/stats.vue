<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box>
        <Header>آمارها</Header>
        <FormBuilder
          ref="formRef"
          :config="formConfig"
          @submitForm="onSubmitForm"
        />
      </Box>
      <Box class="">
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
        <div
          class="grid grid-cols-1 md:grid-cols-2 items-center justify-end !text-base !gap-4 mt-4"
        ></div>
        <SmartTable
          class="smart-scroll"
          emptyText="موردی برای نمایش وجود ندارد."
          delete="stats"
          :data="filteredData.flatMap((c) => [c, ...c.children])"
          :columns="columns"
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
const { request, data } = useApi();
const { $notifyDanger } = useNuxtApp();
// Data
const rawData = ref([]);
const filteredData = ref([]);
const isLoading = ref(true);
const formRef = ref(null);

// Filters
const searchTerm = ref("");

// TODO: به جدول خودش وصل شه و بیشتر از 4 تا اضافه نشه 
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
    label: "عنوان",
    type: "text",
    sortable: true,
  },
  {
    key: "stat",
    label: "مقدار",
    type: "number",
    sortable: true,
    formatOptions: {
      maximumFractionDigits: 0,
    },
  },
]);
const formConfig = reactive({
  formProps: {
    columns: {
      base: 1,
      md: 2,
    },
    loading: true,
    loadingMode: "skeleton",
    showErrorsAs: "inline",
    direction: "rtl",
    validationMode: "onChange",
  },
  sections: [
    {
      title: "",
      collapsible: true,
      _open: true,
      fields: [
        {
          key: "name",
          type: "text",
          label: "عنوان",
          placeholder: "مثلا مشتریان",
          required: true,
          layout: {
            colSpan: {
              base: 1,
              md: 1,
            },
          },
          labelPosition: {
            base: "top",
          },
          validators: [
            {
              type: "required",
              message: "عنوان آمار را وارد کنید",
            },
          ],
        },
        {
          key: "stat",
          type: "number",
          label: "مقدار",
          placeholder: "مثلا 50",
          required: true,
          layout: {
            colSpan: {
              base: 1,
              md: 1,
            },
          },
          labelPosition: {
            base: "top",
          },
          validators: [
            {
              type: "required",
              message: "مقدار آمار را وارد کنید",
            },
          ],
        },
      ],
    },
  ],
  submitButton: {
    text: "ثبت",
    variant: "outline",
    color: "primary-100",
    size: "lg",
    fullWidth: true,
    pending: false,
  },
});
async function onSubmitForm(values) {
  await request("categories", {
    method: "post",
    data: { name: values.name, stat: values.stat },
  });
  if (data.value.status) {
    useNuxtApp().$notifySuccess(data.value.message);
    initialValues.value = { name: "", stat: null };
    fetchData();
    if (formRef.value?.resetForm) formRef.value.resetForm();
  } else {
    useNuxtApp().$notifyDanger(data.value.message);
  }
}
// Transform
function getByPath(obj, path) {
  if (!path) return obj;
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
}
const transformData = (row) => {
  // ردیف‌های زیردسته (هر کدام با ارجاع به پدر)
  const subsRows = (row.subs ?? []).map((sub, sidx) => ({
    ...sub,
    subs: 0, // اگر خودش هم زیردسته دارد
    parentId: row.id,
    __type: "child",
  }));

  return {
    ...row,
    subs: row.subs.length, // تعداد زیردسته‌ها
    __type: "parent", // اختیاری: برای استایل متفاوت در جدول
    children: subsRows,
  };
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

  filteredData.value = list.map(transformData);
};

// Fetch
const API_CONFIG = {
  path: "categories",
  pathToList: "data",
};
const fetchData = async () => {
  isLoading.value = true;
  try {
    if (!API_CONFIG) {
      rawData.value = [];
      filterData();
      return;
    }
    const res = await request(API_CONFIG.path);
    if (!res?.status) {
      $notifyDanger(res?.message || "خطا در دریافت اطلاعات");
      rawData.value = [];
    } else {
      const list = getByPath(res, API_CONFIG.pathToList) ?? res?.body ?? [];
      rawData.value = Array.isArray(list) ? list : [];
    }
    filterData();
  } catch (e) {
    console.log(e);
    $notifyDanger("مشکلی پیش آمد.");
    rawData.value = [];
    filterData();
  } finally {
    isLoading.value = false;
    formConfig.formProps.loading = false;
  }
};

// Watch filters
watch([searchTerm], filterData, { deep: true });

onBeforeMount(fetchData);
</script>
