<template>
  <NuxtLayout name="admin">
    <template #main>
      <Tabs
        :items="[
          { label: 'اطلاعات', value: 'info' },
          { label: 'لینک‌های شبکه اجتماعی', value: 'social' },
          { label: 'طراحی', value: 'desing' },
          { label: 'مشخصات دامنه اختصاصی', value: 'domain' },
          //   { label: 'آمارهای سایت', value: 'stats' },
        ]"
        query-key="tab"
        dir="rtl"
        :style="{ '--tabs-md-cols': 4 }"
      >
        <template #panel:info>
          <Box>
            <Header>اطلاعات برند</Header>
            <FormBuilder
              :config="formConfiginfo"
              :initialValues="initialValuesinfo"
              @fieldChanged="handleProvinceChange"
              @submitForm="onSubmitFormInfo"
            /> </Box
        ></template>
        <template #panel:social>
          <Box
            ><Header>لینک شبکه‌ها اجتماعی</Header>
            <FormBuilder
              :config="formConfigSocial"
              :initialValues="initialValuesSocial"
              @submitForm="onSubmitFormSocial"
            />
          </Box>
        </template>
        <template #panel:domain>
          <Box
            ><Header>تنظیمات دامنه اختصاصی</Header>
            <div class="flex items-baselind gap-2 text-sm text-primary-100 font-bold">
              <Icon
                name="bi:exclamation-circle-fill"
                class="text-secondary-100"
              />
              تنها زمانی دامنه اختصاصی را فعال کرده و دامنه خود را وارد کنید که
              تاییدیه فعال‌سازی کامل آن را از تیم پشتیبانی وندو دریافت کرده
              باشید؛ در غیر این صورت سایت شما دچار مشکل خواهد شد.
            </div>
            <FormBuilder
              :config="formConfigDomain"
              :initialValues="initialValuesDoformConfigDomain"
              @submitForm="onSubmitFormDoformConfigDomain"
            />
          </Box>
        </template>
      </Tabs>
    </template>
  </NuxtLayout>
</template>
<script setup>
import { IR_cities, IR_provinces } from "~/cities";
const { request, data, pending } = useApi();
const { $notifySuccess, $notifyDanger } = useNuxtApp();
async function fetchData() {
  formConfiginfo.formProps.loading = true;
  formConfigSocial.formProps.loading = true;
  formConfigDomain.formProps.loading = true;
  try {
    await request("store");
    if (data.value.status) {
      formConfiginfo.sections[0].fields[5].items =
        data.value.body.work_subjects;
      formConfiginfo.sections[0].fields[8].items = IR_provinces;
    }
  } finally {
    formConfiginfo.formProps.loading = false;
    formConfigSocial.formProps.loading = false;
    formConfigDomain.formProps.loading = false;
  }
}
onBeforeMount(fetchData);
////////////////////////////////////////////// info
const initialValuesinfo = ref({});
const formConfiginfo = reactive({
  formProps: {
    columns: {
      base: 1,
      md: 2,
    },
    disabledAll: false,
    loading: true,
    loadingMode: "skeleton",
    showErrorsAs: "inline",
    autoSaveKey: "",
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
          key: "logo",
          type: "file",
          label: "لوگو",
          isImageUploader: true, // ← این کلید
          multipleFile: false,
          maxFiles: 1,
          sizeClass: "md:w-auto w-full md:h-[30vh] !rounded-full",
          accept: "image/webp,image/jpeg,image/png,image/gif",
          infoText: "نسبت مورد قبول تصویر : 1:1",
          aspectRatio: "1/1",
          watermark: false, // اگر خواستی true کن
          layout: { colSpan: { base: 1, md: 2 } },
          validators: [{ type: "required", message: "عکس مقاله الزامی است." }],
        },
        {
          key: "title",
          type: "text",
          label: "نام برند",
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
          direction: {
            base: "vertical",
          },
          multipleFile: false,
        },
        {
          key: "titileInLatin",
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
          tooltip: "",
          icon: "",
          direction: {
            base: "vertical",
          },
          multipleFile: false,
          labelPosition: {
            base: "right",
          },
          validators: [
            {
              type: "alphaNum",
              message: "url را به درستی وارد کنید",
            },
          ],
        },
        {
          key: "slogn",
          type: "text",
          label: "شعار برند",
          placeholder: "",
          required: false,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
              md: 1,
            },
          },
          tooltip: "این متن در صفحه اصلی نمایش داده میشود",
          icon: "",
          direction: {
            base: "vertical",
          },
          multipleFile: false,
          validators: [
            {
              type: "required",
              message: "اگر شعار ندارید نام برند را وارد کنید.",
            },
          ],
        },
        {
          key: "phoneNumber",
          type: "text",
          label: "شماره تماس",
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
          direction: {
            base: "vertical",
          },
          multipleFile: false,
        },
        {
          key: "work_subject",
          type: "select",
          label: "حوزه کاری",
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
          items: [],
          searchable: true,
          displayField: "name",
          labelField: "name",
          valueField: "id",
          direction: {
            base: "vertical",
          },
          multipleFile: false,
        },
        {
          key: "description",
          type: "textarea",
          label: "توضیح کوتاه درباره برند",
          placeholder: "",
          required: true,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
              md: 2,
            },
          },
          tooltip: "",
          icon: "",
          direction: {
            base: "vertical",
          },
          multipleFile: false,
          validators: [
            {
              type: "required",
              message: "توضیح برند را وارد کنید",
            },
            {
              type: "minLength",
              message: "توضیحات برند باید حداقل 20 حرف باشد",
              value: 20,
            },
            {
              type: "maxLength",
              message: "توضیحات برند باید حداکثر 255حرف باشد",
              value: 256,
            },
          ],
          labelPosition: {
            base: "right",
          },
        },
        {
          key: "address",
          type: "textarea",
          label: "آدرس",
          placeholder: "",
          required: false,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
              md: 2,
            },
          },
          tooltip: "",
          icon: "",
          direction: {
            base: "vertical",
          },
          multipleFile: false,
          labelPosition: {
            base: "right",
          },
        },
        {
          key: "province",
          type: "select",
          label: "استان",
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
          searchable: true,

          items: [],
          searchable: true,
          displayField: "name",
          labelField: "name",
          valueField: ".",
          direction: {
            base: "vertical",
          },
        },
        {
          key: "city",
          type: "select",
          label: "شهر",
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
          items: [],
          displayField: "name",
          labelField: "name",
          valueField: ".",
          emptyMessage: "ابتدا استان خود را انتخاب کنید",
          multipleFile: false,
        },
        {
          key: "lat",
          type: "number",
          label: "عرض جغرافیایی",
          placeholder: "",
          required: false,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
              md: 1,
            },
          },
          tooltip:
            "! برای مثال مختصات جغرافیایی 52.67469038 29.59481693, که می‌توانید از وبسایت نشان دریافت کنید اولین رقم به عنوان عرض جفرافیایی می‌باشد",
          icon: "",
          direction: {
            base: "vertical",
          },
          multipleFile: false,
        },
        {
          key: "lng",
          type: "number",
          label: "طول جغرافیایی",
          placeholder: "",
          required: false,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
              md: 1,
            },
          },
          tooltip:
            "! برای مثال مختصات جغرافیایی 52.67469038 29.59481693, که می‌توانید از وبسایت نشان دریافت کنید دومین رقم به عنوان طول جفرافیایی می‌باشد",
          icon: "",
          direction: {
            base: "vertical",
          },
          multipleFile: false,
        },
      ],
    },
  ],
  submitButton: {
    text: "ثبت",
    variant: "solid",
    color: "primary-100",
    fullWidth: true,
    pending: false,
  },
});
function handleProvinceChange(values) {
  if (values.province) {
    let city = IR_cities.filter((c) => c.province_id == values.province.id);
    formConfiginfo.sections[0].fields[9].items = city;
  }
}
async function onSubmitFormInfo(values) {}
//////////////////////////////////////////////social
const initialValuesSocial = ref({});
const formConfigSocial = reactive({
  formProps: {
    columns: {
      base: 1,
      md: 2,
    },
    disabledAll: false,
    loading: true,
    loadingMode: "skeleton",
    showErrorsAs: "inline",
    autoSaveKey: "",
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
          key: "mail",
          type: "text",
          label: "E-mail",
          placeholder: "مثلا info@vendow.ir",
          required: false,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
              md: 1,
            },
          },
          labelPosition: { base: "top", md: "right" },

          tooltip: "آدرس ایمیل خود را وارد کنید",
          icon: "material-symbols:mail",
        },
        {
          key: "Instagram",
          type: "text",
          label: "Instagram",
          placeholder: "مثلا vendow.shop",
          required: false,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
              md: 1,
            },
          },
          labelPosition: { base: "top", md: "right" },
          tooltip: "id اکانت اینستاگرام خود را وارد کنید",
          icon: "teenyicons:instagram-solid",
        },
        {
          key: "telegram",
          type: "text",
          label: "telegram",
          placeholder: "مثلا vendow.support",
          required: false,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
              md: 1,
            },
          },
          labelPosition: { base: "top", md: "right" },

          tooltip: "id اکانت تلگرام خود را وارد کنید",
          icon: "teenyicons:telegram-solid",
        },
        {
          key: "whatsapp",
          type: "text",
          label: "whatsapp",
          placeholder: "مثلا 09125566589",
          required: false,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
              md: 1,
            },
          },
          labelPosition: { base: "top", md: "right" },

          tooltip: "شماره فعال خود را در واتساپ وارد کنید",
          icon: "teenyicons:whatsapp-solid",
        },
        {
          key: "linkedin",
          type: "text",
          label: "linkedin",
          placeholder: "مثلا 09125566589",
          required: false,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
              md: 1,
            },
          },
          labelPosition: { base: "top", md: "right" },

          tooltip: "لینک به اشتراک گذاری شما در لینکدین",
          icon: "teenyicons:linkedin-solid",
        },
      ],
    },
  ],
  submitButton: {
    text: "ثبت",
    variant: "solid",
    color: "primary-100",
    fullWidth: true,
    pending: false,
  },
});
async function onSubmitFormSocial(values) {}
////////////////////////////////////////////design
////////////////////////////////////////////domain
const initialValuesDomain = ref({});
const formConfigDomain = reactive({
  formProps: {
    columns: {
      base: 1,
    },
    disabledAll: false,
    loading: true,
    loadingMode: "skeleton",
    showErrorsAs: "inline",
    autoSaveKey: "",
    direction: "rtl",
    validationMode: "onChange",
  },
  sections: [
    {
      title: "",
      collapsible: false,
      _open: true,
      fields: [
        {
          key: "redirect",
          type: "checkboxGroup",
          label: "فعال بودن دامنه اختصاصی",
          layout: {
            colSpan: {
              base: 1,
            },
          },
          // labelPosition: { base: "top", md: "right" },

          tooltip: "",
        },
        {
          key: "domain",
          type: "text",
          label: "آدرس دامنه",
          placeholder: "مثلا vendow.ir",
          required: false,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
            },
          },
          // labelPosition: { base: "top", md: "right" },
        },
      ],
    },
  ],
  submitButton: {
    text: "ثبت",
    variant: "solid",
    color: "primary-100",
    fullWidth: true,
    pending: false,
  },
});
async function onSubmitFormDomain(values) {}
</script>
