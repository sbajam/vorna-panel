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
    title: " ویرایش خدمات",
    columns: {
      base: 1,
      md: 2,
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
          aspectRatio: "3/2",
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
const initialValues = ref({
  image: null, // ← URL سرور (مثلاً https://.../image.jpg)  | یا آرایه‌ای از URLها
  title: "",
  titleInLatin: "",
  summary: "",
  fullText: "",
  faq: [], // [{question:'',answer:''}, ...]
});
async function fetchData() {
  try {
    formConfig.formProps.loading = true;
    await request(`services/${useRoute().params.id}`);

    if (!data.value?.status) {
      $notifyDanger(data.value?.message || "خطا در دریافت اطلاعات");
      return;
    }

    const body = data.value.body || {};

    // این مپ رو با فیلدهای واقعی API خودت هماهنگ کن:
    initialValues.value = {
      image: body.image || body.imageUrl || "", // باید URL باشه
      title: body.title || "",
      titleInLatin: body.titleInLatin || body.slug || "",
      summary: body.summary || "",
      fullText: body.fullText || "",
      faq: Array.isArray(body.faq) ? body.faq : [], // [{question,answer}]
    };
  } catch (e) {
    $notifyDanger("مشکلی در دریافت اطلاعات رخ داد.");
    console.error(e);
  } finally {
    formConfig.formProps.loading = false;
  }
}

onBeforeMount(fetchData);

async function onSubmitForm(values) {
  try {
    formConfig.submitButton.pending = true;

    // ساخت FormData
    const fd = new FormData();
    fd.append("title", values.title || "");
    fd.append("titleInLatin", values.titleInLatin || "");
    fd.append("summary", values.summary || "");
    fd.append("fullText", values.fullText || "");
    fd.append("faq", JSON.stringify(values.faq || []));

    const img = Array.isArray(values.image) ? values.image[0] : values.image;
    if (img instanceof File) {
      fd.append("image", img);
    }

    await request(`services/${useRoute().params.id}`, {
      method: "put",
      data: fd,
    });

    if (data.value?.status) {
      $notifySuccess(data.value?.message || "با موفقیت ویرایش شد");
      navigateTo("/services"); // مسیر دلخواهت
    } else {
      $notifyDanger(data.value?.message || "ثبت تغییرات ناموفق بود");
    }
  } catch (e) {
    console.error(e);
    $notifyDanger("خطا در ثبت تغییرات");
  } finally {
    formConfig.submitButton.pending = false;
  }
}
</script>
