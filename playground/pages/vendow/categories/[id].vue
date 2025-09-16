<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box>
        <Header>ویرایش دسته‌بندی‌ها</Header>
        <FormBuilder :config="formConfig" @submitForm="onSubmitForm" />
      </Box>
    </template>
  </NuxtLayout>
</template>

<script setup>
import { Body } from "#components";

const { request, data } = useApi();
const { $notifyDanger } = useNuxtApp();
// Data
const rawData = ref([]);
const isLoading = ref(true);
let parentItems = computed(() => [
  { name: "بدون دسته بندی پدر", id: null },
  ...rawData.value.map((c) => ({ name: c.name, id: c.id })),
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
          placeholder: "عنوان دسته بندی",
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
              message: "عنوان دسته بندی را وارد کنید",
            },
          ],
        },
        {
          key: "parent",
          type: "select",
          label: "دسته بندی پدر",
          placeholder: "دسته بندی پدر را انتخاب کنید",
          required: false,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
            },
          },
          items: parentItems,
          direction: {
            base: "vertical",
          },
          labelPosition: {
            base: "top",
          },
          searchable: true,
          clearableSelect: true,
          labelField: "name",
          valueField: ".",
          displayField: "name",
        },
      ],
    },
  ],
  submitButton: {
    text: "ویرایش",
    variant: "outline",
    color: "primary-100",
    size: "lg",
    fullWidth: true,
    pending: false,
  },
});
async function onSubmitForm(values) {
  await request(`categories/${useRoute().params.id}`, {
    method: "put",
    data: { name: values.name, parentId: values.parent.id },
  });
  if (data.value.status) {
    useNuxtApp().$notifySuccess(data.value.message);
    // fetchData();
    useRouter().back()
  } else {
    useNuxtApp().$notifyDanger(data.value.message);
  }
}
// Fetch
const API_CONFIG = {
  path: "categories",
  pathToList: "data",
};
const fetchData = async () => {
  isLoading.value = true;
  try {
    const res = await request(API_CONFIG.path);
    const res2 = await request(`categories/${useRoute().params.id}`);

    if (res?.status && res2?.status) {
      rawData.value = res?.body;
      formConfig.sections[0].fields[0].defaultValue = res2?.body?.name;
      formConfig.sections[0].fields[1].defaultValue = rawData.value.find(c=>c.id==res2?.body?.parentId);
    } else {
      $notifyDanger(res2?.message || res?.message || "خطا در دریافت اطلاعات");
      rawData.value = [];
    }
  } finally {
    isLoading.value = false;
    formConfig.formProps.loading = false;
  }
};
onBeforeMount(fetchData);
</script>
