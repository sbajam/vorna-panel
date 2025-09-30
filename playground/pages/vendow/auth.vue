<template>
  <NuxtLayout name="admin">
    <template #main>
      <Tabs
        :items="[
          { label: 'شخص حقیقی', value: 'person' },
          { label: 'شخص حقوقی', value: 'compony' },
        ]"
        query-key="tab"
        dir="rtl"
        :style="{ '--tabs-md-cols': 2 }"
      >
        <template #panel:person>
          <Box class="">
            <Header class="">   احراز هویت شخص حقیقی </Header>

            <FormBuilder
              :config="formConfig"
              :initialValues="initialValues"
              @validationError="onValidationError"
              @submitForm="onSubmitForm"
            />
          </Box>
        </template>
        <template #panel:compony></template>
      </Tabs>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IR_cities, IR_provinces } from "~/cities";
// مقادیر اولیهٔ فرم
let initialValues = ref({});
const cityItemsFor = (provinceId: number | string) =>
  IR_cities.filter((i) => i.province_id == provinceId).map((c) => ({
    ...c,
    label: c.name,
  }));
// کانفیگِ نهاییِ فرم
const formConfig = {
  formProps: {
    columns: {
      base: 1,
      lg: 2,
    },
    disabledAll: false,
    loading: false,
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
      collapsible: true,
      _open: true,
      fields: [
        {
          key: "fullName",
          type: "text",
          label: "نام و نام خانوادگی",
          placeholder: "نام خود را وارد کنید",
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
              type: "persianLetters",
              message: "نام و نام خانودگی را به درستی وارد کنید",
            },
          ],
        },
        {
          key: "uuid",
          type: "text",
          label: "کد ملی",
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
          multipleFile: false,
          labelPosition: {
            base: "top",
          },
          validators: [
            {
              type: "numeric",
              message: "کد ملی را به درستی وارد کنید",
            },
          ],
          mask: {
            thousandsSeparator: "",
          },
        },
        {
          key: "phoneNumber",
          type: "text",
          label: "شماره همراه",
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
          multipleFile: false,
          labelPosition: {
            base: "top",
          },
          mask: {
            mask: "0\\9999999999",
          },
          validators: [
            {
              type: "mobile",
              message: "شماره تماس را به درستی وارد کنید",
            },
          ],
        },
        {
          key: "homeNumber",
          type: "text",
          label: "شماره تماس ثابت",
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
          multipleFile: false,
          labelPosition: {
            base: "top",
          },
          mask: {
            thousandsSeparator: "",
          },
          validators: [
            {
              type: "phone",
              message: "شماره ثابت را به درستی وارد کنید",
            },
          ],
        },
        {
          key: "province",
          type: "select",
          label: "استان",
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
          items: IR_provinces.map((p) => ({
            ...p,label:p.name
          })),
          displayKey: "label",
          direction: {
            base: "vertical",
          },
          multipleFile: false,
          labelPosition: {
            base: "top",
          },
          searchable: true,
          onChange: (val: any) => {
            const cities = cityItemsFor(val);
            const sec = formConfig.sections[0];
            const cityField = sec.fields.find((f: any) => f.key === "city");
            if (cityField) {
              cityField.items = cities;
            }
          },
          validators: [],
        },
        {
          key: "city",
          type: "select",
          label: "شهر",
          placeholder: "شهر خود را انتخاب کنید",
          required: true,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
              md: 1,
            },
          },
          emptyMessage: "ابتدا استان خود را انتخاب کنید",
          tooltip: "",
          icon: "",
          items: [] as any[],
          searchable: true,
          displayKey: "label",

          direction: {
            base: "vertical",
          },
          multipleFile: false,
          labelPosition: {
            base: "top",
          },
        },
        {
          key: "postalCode",
          type: "text",
          label: "کد پستی",
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
          multipleFile: false,
          labelPosition: {
            base: "top",
          },
          mask: {
            thousandsSeparator: "",
          },
          validators: [
            {
              type: "numeric",
              message: "کد پستی را به درستی وارد کنید",
            },
          ],
        },
        {
          key: "taxCode",
          type: "text",
          label: "کد مالیاتی",
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
          multipleFile: false,
          labelPosition: {
            base: "top",
          },
          mask: {
            thousandsSeparator: "",
          },
          validators: [
            {
              type: "minLength",
              message: "کد مالیاتی را به درستی وارد کنید",
              value: 10,
            },
            {
              type: "maxLength",
              message: "کد مالیاتی را به درستی وارد کنید",
              value: 10,
            },
            {
              type: "numeric",
              message: "کد مالیاتی را به درستی وارد کنید",
            },
          ],
        },
        {
          key: "shaba",
          type: "text",
          label: "شماره شبا",
          placeholder: "",
          required: true,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
              md: 2,
            },
          },
          tooltip:
            "شماره شبا باید با شناسه ملی ثبت نام کننده همخوانی داشته باشد.پ",
          icon: "",
          direction: {
            base: "vertical",
          },
          multipleFile: false,
          labelPosition: {
            base: "top",
          },
          mask: {
            thousandsSeparator: "",
          },
          validators: [
            {
              type: "numeric",
              message: "شماره شبا را به درستی وارد کنید",
            },
          ],
        },
        {
          key: "address",
          type: "textarea",
          label: "آدرس",
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
    size: "lg",
    pending: false,
  },
};

function onValidationError({
  field,
  message,
}: {
  field: string;
  message: string;
}) {
  alert("خطا در فیلد «" + field + "»: " + message);
}
const { request, data } = useApi();
async function fetchData() {
  await request("/store/verify");
  if (data.value.status) {
    initialValues.value = data.value.body;
  } else {
    useNuxtApp().$notifyDanger(data.value.message);
  }
}
async function onSubmitForm(values: Record<string, any>, type: Boolean) {
  await request("/store/verify", {
    method: "post",
    data: {
      type,
      fullName: values.fullName,
      phoneNumber: values.phoneNumber,
      homeNumber: values.homeNumber,
      postalCode: values.postalCode,
      uuid: values.uuid,
      city: values.city,
      province: values.province,
      address: values.address,
      taxCode: values.taxCode,
      shaba: values.shaba,
    },
  });
  useNuxtApp().$notify(
    data?.status ? "success" : "danger",
    data?.value.message
  );
}
</script>
