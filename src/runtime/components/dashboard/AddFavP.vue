<template>
  <NuxtLayout name="modal">
    <FormBuilder
      class="min-w-[800px]"
      :config="formConfig"
      @validationError="onValidationError"
      @submitForm="onSubmitForm"
    />
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  ref,
  useCookie,
  useNuxtApp,
  useRoute,
  navigateTo,
  useRouter,
  useRuntimeConfig,
  computed,
  onBeforeMount,
  watch,
  nextTick,
  onMounted
} from "#imports";

// import { ref, watch } from 'vue';

// مقادیر اولیهٔ فرم
let prop = defineProps({
  isGet: {
    type: Boolean,
    default: false,
  },
});
let emit = defineEmits(["submitForm"]);
// کانفیگِ نهاییِ فرم
const formConfig = ref({
  formProps: {
    title: "اضافه کردن به لیست علاقه‌مندی",
    columns: {
      base: 1,
    },
    disabledAll: false,
    loading: prop.isGet,
    loadingMode: "skeleton",
    showErrorsAs: "inline",
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
          key: "id",
          type: "text",
          label: "id",
          placeholder: "",
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
              message: "id الزامی است",
            },
          ],
        },
        {
          key: "name",
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
            base: "top",
          },
          validators: [
            {
              type: "required",
              message: "عنوان الزامی است",
            },
          ],
        },
        {
          key: "icon",
          type: "text",
          label: "icon",
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
            base: "top",
          },
        },
        {
          key: "link",
          type: "text",
          label: "لینک",
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
              type: "required",
              message: "لینک الزامی است ",
            },
          ],
        },
      ],
    },
  ],
  submitButton: {
    text: "اضافه کردن",
    variant: "solid",
    size: "lg",
    color: "primary-100",
    pending: false,
  },
});
watch(
  () => prop.isGet,
  (newVal) => {
    formConfig.value.formProps.loading = newVal;
    formConfig.value.submitButton.pending = newVal;
  },
  { immediate: true }
);
function onValidationError({
  field,
  message,
}: {
  field: string;
  message: string;
}) {
  alert("خطا در فیلد «" + field + "»: " + message);
}

async function onSubmitForm(values: Record<string, any>) {
  emit("submitForm", values);
}
</script>
