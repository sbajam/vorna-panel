<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box class="">
        <FormBuilder
          :initialValues="initialValues"
          :config="formConfig"
          @submitForm="onSubmitForm"
        />
      </Box>
    </template>
  </NuxtLayout>
</template>

<script setup>
const { request, data } = useApi();
const { $notifyDanger, $notifySuccess } = useNuxtApp();
const formConfig = reactive({
  formProps: {
    title: "ویرایش  نظر مشتریان",
    columns: {
      base: 1,
    },
    loadingMode: "skeleton",
    loading: true,
    showErrorsAs: "inline",
    direction: "rtl",
    validationMode: "onChange",
    defaultValues: {},
  },
  sections: [
    {
      title: "",
      collapsible: false,
      _open: true,
      fields: [
        {
          key: "title",
          type: "text",
          label: "عنوان",
          placeholder: "",
          required: true,
          layout: {
            colSpan: {
              base: 1,
            },
          },
          labelPosition: {
            base: "right",
          },
          validators: [
            {
              type: "required",
              message: "لطفا عنوان را وارد کنید",
            },
          ],
        },

        {
          key: "text",
          type: "richtext",
          label: "متن",
          image: false, //TODO:
          layout: {
            colSpan: {
              base: 1,
            },
          },
          direction: {
            base: "vertical",
          },
          labelPosition: {
            base: "right",
          },
          validators: [
            {
              type: "required",
              message: "لطفا متن را وارد کنید",
            },
          ],
        },
      ],
    },
  ],
  submitButton: {
    text: "ثبت",
    variant: "solid",
    color: "primary-100",
    pending: false,
  },
});
let initialValues = ref({
  title: "",
  text: "",
});
async function fetchData() {
  try {
    formConfig.formProps.loading = true;
    await request(`testimonies/${useRoute().params.id}`);
    if (data.value.status) {
      // TODO:
      initialValues.value = data.vaue.body;
    }
  } catch (err) {
    console.log(err);
    $notifyDanger(err);
  } finally {
    formConfig.formProps.loading = false;
  }
}
onBeforeMount(fetchData);

async function onSubmitForm(values) {
  try {
    formConfig.formProps.loading = true;
    console.log(values);
    // TODO: منطق ارسال فرم
    await request(`testimonies/${useRoute().params.id}`, {
      method: "put",
      data: { title: values.title, text: values.text },
    });
    if (data.value.status) {
      $notifySuccess(data.value.message);
      navigateTo("../");
    } else $notifyDanger(data.value.message);
  } finally {
    formConfig.formProps.loading = false;
  }
}
</script>
