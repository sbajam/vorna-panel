<template>
  <div class="p-6 space-y-4">
    <h1 class="text-xl font-bold mb-2">🔍 API Schema Inspector</h1>

    <FormBuilder
      :config="formConfig"
      @submitForm="onSubmitForm"
    />

    <!-- Display schema results -->
    <div v-if="Object.keys(schemas).length" class="mt-4 space-y-4">
      <div
        v-for="(schema, route) in schemas"
        :key="route"
        class="p-4 border rounded bg-white"
      >
        <h2 class="font-bold mb-1 text-blue-600">{{ route }}</h2>
        <pre class="text-sm text-gray-800">{{ formatSchema(schema) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
const schemas = ref({});
// کانفیگِ نهاییِ فرم
const formConfig = ref({
  formProps: {
    title: "",
    columns: {
      base: 1,
    },
    disabledAll: false,
    loading: false,
    loadingMode: "button",
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
          key: "inputRoutes",
          type: "textarea",
          label: "APIs",
          placeholder: "/articles,/products",
          required: true,
          disabled: false,
          layout: {
            colSpan: {
              base: 1,
              md: 1,
            },
          },
          tooltip: "Enter API routes separated by commas",
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
    text: "دریافت",
    variant: "solid",
    color: "primary-100",
    size: "lg",
    pending: false,
  },
});
function formatSchema(obj, indent = 2) {
  return JSON.stringify(obj, null, indent);
}
// نوع‌دهی خروجی: { [route: string]: any }
async function onSubmitForm(values) {
  formConfig.value.formProps.loading = true;
  formConfig.value.submitButton.pending = true;
  schemas.value = {};

  const routes = values.inputRoutes
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);

  const { request, data, error } = useApi();

  for (const route of routes) {
    await request(route);

    if (data.value?.status && data.value?.body) {
      const body = data.value.body;
      const structure = extractSchema(body);
      schemas.value[route] = structure;
    } else {
      schemas.value[route] = {
        error: data.value?.message || "Failed to fetch",
      };
    }
  }

  formConfig.value.formProps.loading = false;
  formConfig.value.submitButton.pending = false;
}
// تبدیل نمونه داده به اسکلت ساده
function extractSchema(value) {
  if (Array.isArray(value)) {
    return value.length ? [extractSchema(value[0])] : [];
  } else if (typeof value === "object" && value !== null) {
    const schema = {};
    for (const key in value) {
      const type = typeof value[key];
      schema[key] = Array.isArray(value[key])
        ? [typeof value[key][0] ?? "unknown"]
        : type;
    }
    return schema;
  }
  return typeof value;
}
</script>
