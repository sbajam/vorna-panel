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
    title: "ویرایش  سوال متداول",
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
          key: "question",
          type: "textarea",
          label: "سوال",
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
              message: "لطفا سوال را وارد کنید",
            },
          ],
        },

        {
          key: "answer",
          type: "richtext",
          label: "پاسخ",
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
              message: "لطفا پاسخ را وارد کنید",
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
    await request(`faq/${useRoute().params.id}`);
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
    await request(`faq/${useRoute().params.id}`, {
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
