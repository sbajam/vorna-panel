<template>
  <NuxtLayout name="admin">
    <template #main>
      <Tabs
        :items="[
          { label: 'درباره ما', value: 'about' },
          { label: 'چرا ما', value: 'why' },
          { label: 'شرایط همکاری', value: 'term' },
        ]"
        query-key="tab"
        dir="rtl"
        :style="{ '--tabs-md-cols': 3 }"
      >
        <template #panel:about>
          <Box>
            <FormBuilder
              :config="aboutConfig"
              @validationError="onValidationError"
              @submitForm="(val) => onSubmitForm(val, 'about')"
            />
          </Box>
        </template>
        <template #panel:why>
          <Box>
            <FormBuilder
              :config="whyConfig"
              @validationError="onValidationError"
              @submitForm="(val) => onSubmitForm(val, 'why')"
            />
          </Box>
        </template>
        <template #panel:term>
          <Box>
            <FormBuilder
              :config="termConfig"
              @validationError="onValidationError"
              @submitForm="(val) => onSubmitForm(val, 'term')"
            />
          </Box>
        </template>
      </Tabs>
    </template>
  </NuxtLayout>
</template>
<script setup>
const { request, data, pending } = useApi();
const { $notifyDanger, $notifySuccess } = useNuxtApp();
const aboutConfig = reactive({
  formProps: {
    title: "درباره ما",
    columns: {
      base: 1,
    },
    loading: false,
    loadingMode: "skeleton",
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
          key: "video",
          type: "toggle",
          label: "عکس یا ویدیو",
          placeholder: "",
          required: false,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
            },
          },
          tooltip:
            "برای اپلود ویدیو به جای عکس ویدیو را در پلتفرم های مشابه آپارات بارگذاری کنید و کد iframe را جایگذاری کنید",
          icon: "",

          multipleFile: false,
          labelPosition: {
            base: "right",
          },
          size: "lg",
          offColor: "bg-secondary-100",
          onColor: "bg-primary-100",
        },
        {
          key: "iframe",
          type: "textarea",
          label: "کد ویدیو",
          placeholder: "",
          required: false,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
            },
          },
          tooltip:
            "برای اپلود ویدیو به جای عکس ویدیو را در پلتفرم های مشابه آپارات بارگذاری کنید و کد iframe را جایگذاری کنید",
          icon: "",
          showIf: (v) => !!v.video,
          multipleFile: false,
          labelPosition: {
            base: "right",
          },
        },
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
            },
          },
          tooltip: "",
          icon: "",
          showIf: (v) => !v.video,
          isImageUploader: true,
          sizeClass: "h-[30vh]",
          aspectRatio: "3/2",
          multipleFile: false,
          labelPosition: {
            base: "right",
          },
        },
        {
          key: "content",
          type: "richtext",
          label: "توضیحات",
          placeholder: "",
          required: false,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
              md: 1,
            },
          },
          tooltip: "",
          icon: "",

          multipleFile: false,
          labelPosition: {
            base: "top",
          },
        },
      ],
    },
  ],
  submitButton: {
    text: "ارسال",
    variant: "solid",
    color: "primary-100",
    fullWidth: true,
    pending: false,
  },
});
const whyConfig = reactive({
  formProps: {
    title: "چرا ما",
    columns: {
      base: 1,
    },
    loading: false,
    loadingMode: "skeleton",
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
          key: "video",
          type: "toggle",
          label: "عکس یا ویدیو",
          placeholder: "",
          required: false,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
            },
          },
          tooltip:
            "برای اپلود ویدیو به جای عکس ویدیو را در پلتفرم های مشابه آپارات بارگذاری کنید و کد iframe را جایگذاری کنید",
          icon: "",

          multipleFile: false,
          labelPosition: {
            base: "right",
          },
          size: "lg",
          offColor: "bg-secondary-100",
          onColor: "bg-primary-100",
        },
        {
          key: "iframe",
          type: "textarea",
          label: "کد ویدیو",
          placeholder: "",
          required: false,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
            },
          },
          tooltip:
            "برای اپلود ویدیو به جای عکس ویدیو را در پلتفرم های مشابه آپارات بارگذاری کنید و کد iframe را جایگذاری کنید",
          icon: "",
          showIf: (v) => !!v.video,
          multipleFile: false,
          labelPosition: {
            base: "right",
          },
        },
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
            },
          },
          tooltip: "",
          icon: "",
          showIf: (v) => !v.video,
          isImageUploader: true,
          sizeClass: "h-[30vh]",
          aspectRatio: "3/2",
          multipleFile: false,
          labelPosition: {
            base: "right",
          },
        },
        {
          key: "content",
          type: "richtext",
          label: "توضیحات",
          placeholder: "",
          required: false,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
              md: 1,
            },
          },
          tooltip: "",
          icon: "",

          multipleFile: false,
          labelPosition: {
            base: "top",
          },
        },
      ],
    },
  ],
  submitButton: {
    text: "ارسال",
    variant: "solid",
    color: "primary-100",
    fullWidth: true,
    pending: false,
  },
});
const termConfig = reactive({
  formProps: {
    title: "شرایط همکاری با ما",
    columns: {
      base: 1,
    },
    loading: false,
    loadingMode: "skeleton",
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
          key: "video",
          type: "toggle",
          label: "عکس یا ویدیو",
          placeholder: "",
          required: false,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
            },
          },
          tooltip:
            "برای اپلود ویدیو به جای عکس ویدیو را در پلتفرم های مشابه آپارات بارگذاری کنید و کد iframe را جایگذاری کنید",
          icon: "",

          multipleFile: false,
          labelPosition: {
            base: "right",
          },
          size: "lg",
          offColor: "bg-secondary-100",
          onColor: "bg-primary-100",
        },
        {
          key: "iframe",
          type: "textarea",
          label: "کد ویدیو",
          placeholder: "",
          required: false,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
            },
          },
          tooltip:
            "برای اپلود ویدیو به جای عکس ویدیو را در پلتفرم های مشابه آپارات بارگذاری کنید و کد iframe را جایگذاری کنید",
          icon: "",
          showIf: (v) => !!v.video,
          multipleFile: false,
          labelPosition: {
            base: "right",
          },
        },
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
            },
          },
          tooltip: "",
          icon: "",
          showIf: (v) => !v.video,
          isImageUploader: true,
          sizeClass: "h-[30vh]",
          aspectRatio: "3/2",
          multipleFile: false,
          labelPosition: {
            base: "right",
          },
        },
        {
          key: "content",
          type: "richtext",
          label: "توضیحات",
          placeholder: "",
          required: false,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
              md: 1,
            },
          },
          tooltip: "",
          icon: "",

          multipleFile: false,
          labelPosition: {
            base: "top",
          },
        },
      ],
    },
  ],
  submitButton: {
    text: "ارسال",
    variant: "solid",
    color: "primary-100",
    fullWidth: true,
    pending: false,
  },
});

function onValidationError({ field, message }) {
  $notifyDanger("خطا در فیلد «" + field + "»: " + message);
}

async function onSubmitForm(values, key) {
  // TODO: منطق ارسال فرم
}
</script>
