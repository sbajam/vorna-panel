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
// مقادیر اولیهٔ فرم

// کانفیگِ نهاییِ فرم
const formConfig = reactive({
  formProps: {
    title: "اضافه کردن خدمات",
    columns: {
      base: 1,
      md: 2,
    },
    loadingMode: "skeleton",
    loading:false,
    showErrorsAs: "inline",
    autoSaveKey: "services",
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
          key: "image",
          type: "file",
          label: "تصویر",
          placeholder: "",
          required: false,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
              md: 2,
            },
          },
          isImageUploader: true,
          sizeClass: "h-[30vh]",
          aspectRatio:"3/2",
          multipleFile: false,
          labelPosition: {
            base: "right",
            md: "right",
          },
          watermark: false,
          validators: [
            {
              type: "required",
              message: "لطفا عکس را وارد کنید",
            },
          ],
        },
        {
          key: "title",
          type: "text",
          label: "عنوان",
          placeholder: "",
          required: true,
          layout: {
            colSpan: {
              base: 1,
              md: 1,
            },
          },
          labelPosition: {
            base: "right",
            lg: "top",
          },
          validators: [
            {
              type: "required",
              message: "لطفا عنوان را وارد کنید",
            },
          ],
        },
        {
          key: "titleInLatin",
          type: "text",
          label: "url",
          placeholder: "",
          required: false,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
              md: 1,
            },
          },
          direction: {
            base: "vertical",
          },
          labelPosition: {
            base: "right",
            md: "top",
          },
          validators: [
            {
              type: "required",
              message: "لطفا url را وارد کنید",
            },
            {
              type: "alphaNum",
              message: " url باید به زبان لاتین باشد",
            },
          ],
        },
        {
          key: "summary",
          type: "textarea",
          label: "خلاصه",

          required: true,
          layout: {
            colSpan: {
              base: 1,
              md: 2,
            },
          },
          tooltip: "خلاصه به عنوان meta description هم استفاده میشود",

          labelPosition: {
            base: "right",
            md: "top",
          },
          validators: [
            {
              type: "required",
              message: "لطفا خلاصه را وارد کنید",
            },
          ],
        },
        {
          key: "fullText",
          type: "richtext",
          label: "توضیحات",
          placeholder: "",
          layout: {
            colSpan: {
              base: 1,
              md: 2,
            },
          },
          direction: {
            base: "vertical",
          },
          labelPosition: {
            base: "right",
            md: "top",
          },
          validators: [
            {
              type: "required",
              message: "لطفا توضیحات را وارد کنید",
            },
          ],
        },
        {
          key: "faq",
          type: "array",
          label: "سوالات متداول",
          placeholder: "",

          layout: {
            colSpan: {
              base: 1,
              md: 2,
            },
          },

          itemFields: [
            {
              key: "question",
              type: "textarea",
              label: "سوال",
              layout: {
                colSpan: {
                  base: 1,
                },
              },
            },
            {
              key: "answer",
              type: "textarea",
              label: "پاسخ",
              layout: {
                colSpan: {
                  base: 1,
                },
              },
            },
          ],
          minItems: 0,
          labelPosition: {
            base: "right",
            md: "top",
          },
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
//     await request("services");
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
    let fd = new FormData();
    fd.append("key", values);
    await request("services", { method: "post", data: fd });
    if (data.value.status) {
      $notifySuccess(data.value.message);
      navigateTo("../");
    } else $notifyDanger(data.value.message);
  } finally {
    formConfig.formProps.loading = false;
  }
}
</script>
