<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box class="">
        <FormBuilder :config="formConfig" @submitForm="onSubmitForm" />
      </Box>
    </template>
  </NuxtLayout>
</template>

<script setup>
const {request,data}=useApi()
const {$notifyDanger,$notifySuccess}=useNuxtApp()

// کانفیگِ نهاییِ فرم
const formConfig = reactive({
  formProps: {
    title: "اضافه کردن سوال متداول",
    columns: {
      base: 1,
    },
    loadingMode: "skeleton",
    loading: false,
    showErrorsAs: "inline",
    autoSaveKey: "testimonies",
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

async function fetchData() {
  //   try {
  //     formConfig.formProps.loading = true;
  //     await request("faq");
  //     if (data.value.status) {
  //     let t=data.value.body;
  //     let e = formConfig.sections[0].fields.find((e) => e.key == "service").items;
  //     formConfig.sections[0].fields.find((e) => e.key == "service").items = [
  //       ...e,
  //       ...t,
  //     ];
  //     }
  //   } catch (err) {
  //     console.log(err);
  //     $notifyDanger(err);
  //   } finally {
  //     formConfig.formProps.loading = false;
  //   }
}
onBeforeMount(fetchData);

async function onSubmitForm(values) {
  try {
    formConfig.formProps.loading = true;
    console.log(values);
    // TODO: منطق ارسال فرم
    await request("faq", {
      method: "post",
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
