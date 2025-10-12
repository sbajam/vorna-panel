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
const { $notifyDanger, $notifySuccess } = useNuxtApp();

// ❗️دو نمونه‌ی جدا از useApi تا data قاطی نشه
const apiServices = useApi();
const apiProject = useApi();

const route = useRoute();

const formConfig = reactive({
  formProps: {
    title: "ویرایش پروژه",
    columns: { base: 1, md: 2 },
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
          layout: { colSpan: { base: 1, md: 1 } },
          isImageUploader: true,
          sizeClass: "h-[30vh]",
          aspectRatio: "3/2",
          multipleFile: false,
          labelPosition: { base: "right", md: "right" },
          watermark: false,
          validators: [{ type: "required", message: "لطفا عکس را وارد کنید" }],
        },
        {
          key: "service",
          type: "select",
          label: "خدمات",
          layout: { colSpan: { base: 1, md: 1 } },
          items: [{ title: "بدون خدمت", id: "0" }],
          labelField: "title",
          valueField: "id",
          displayField: "title",
          searchable: true,
          clearableSelect: false,
          labelPosition: { base: "right", md: "top" },
        },
        {
          key: "title",
          type: "text",
          label: "عنوان",
          layout: { colSpan: { base: 1, md: 1 } },
          labelPosition: { base: "right", lg: "top" },
          validators: [
            { type: "required", message: "لطفا عنوان را وارد کنید" },
          ],
        },
        {
          key: "titleInLatin",
          type: "text",
          label: "url",
          layout: { colSpan: { base: 1, md: 1 } },
          labelPosition: { base: "right", md: "top" },
          validators: [
            { type: "required", message: "لطفا url را وارد کنید" },
            { type: "alphaNum", message: " url باید به زبان لاتین باشد" },
          ],
        },
        {
          key: "meta",
          type: "array",
          label: "جزییات پروژه",
          layout: { colSpan: { base: 1, md: 2 } },
          itemFields: [
            {
              key: "key",
              type: "text",
              label: "عنوان",
              layout: { colSpan: { base: 1 } },
            },
            {
              key: "value",
              type: "text",
              label: "مقدار",
              layout: { colSpan: { base: 1 } },
            },
          ],
          minItems: 0,
          labelPosition: { base: "right", md: "top" },
        },
        {
          key: "summary",
          type: "textarea",
          label: "خلاصه",
          layout: { colSpan: { base: 1, md: 2 } },
          tooltip: "خلاصه به عنوان meta description هم استفاده میشود",
          labelPosition: { base: "right", md: "top" },
          validators: [
            { type: "required", message: "لطفا خلاصه را وارد کنید" },
          ],
        },
        {
          key: "fullText",
          type: "richtext",
          label: "توضیحات",
          layout: { colSpan: { base: 1, md: 2 } },
          labelPosition: { base: "right", md: "top" },
          validators: [
            { type: "required", message: "لطفا توضیحات را وارد کنید" },
          ],
        },
        {
          key: "faq",
          type: "array",
          label: "سوالات متداول",
          layout: { colSpan: { base: 1, md: 2 } },
          itemFields: [
            {
              key: "question",
              type: "textarea",
              label: "سوال",
              layout: { colSpan: { base: 1 } },
            },
            {
              key: "answer",
              type: "textarea",
              label: "پاسخ",
              layout: { colSpan: { base: 1 } },
            },
          ],
          minItems: 0,
          labelPosition: { base: "right", md: "top" },
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

// ✅ مقادیر پیش‌فرض برای تست UI
const initialValues = ref({
  image:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOH99946ELGBVR986yJb4HltQAsc2hmx_gGQ&s",
  service: "0",
  title: "نمونه پروژه شماره ۱",
  titleInLatin: "sample-project-1",
  meta: [
    { key: "موقعیت", value: "تهران" },
    { key: "سال", value: "1403" },
  ],
  summary: "این یک خلاصهٔ تستی برای پروژه است.",
  fullText: "<p>توضیحات کامل پروژه به صورت <strong>HTML</strong> این‌جاست.</p>",
  faq: [
    { question: "این پروژه چیست؟", answer: "یک نمونه است." },
    { question: "چطور انجام شد؟", answer: "با بهترین روش‌ها." },
  ],
});

// 🔁 فچ همزمان سرویس‌ها و دیتای پروژه + پر کردن initialValues
async function fetchData() {
  try {
    formConfig.formProps.loading = true;
    const id = route.params.id;
    // همزمان
    const [resServices, resProject] = await Promise.all([
      apiServices.request("services"),
      apiProject.request(`projects/${id}`),
    ]);

    // --- خدمات ---
    const servicesOk = resServices?.value?.status === true;
    const services = servicesOk ? resServices.value.body || [] : [];
    const base = [{ title: "بدون خدمت", id: "0" }];
    const serviceField = formConfig.sections[0].fields.find(
      (f) => f.key === "service"
    );
    if (serviceField) {
      serviceField.items = [...base, ...services];
    }

    // --- پروژه ---
    const projectOk = resProject?.value?.status === true;
    if (projectOk) {
      const p = resProject.value.body || {};

      // 📌 نکته‌ی مهم برای پیش‌نمایش تصویر:
      // initialValues.image باید URL (یا آرایه URL) باشد تا ImageUploader پیش‌نمایش بده.
      // FormBuilder شما این URL را به‌صورت initialImages به ImageUploader پاس می‌دهد.
      const imageUrl = p.image || p.imageUrl || p.cover || ""; // فیلدی که API برمی‌گرداند را اینجا مچ کن

      initialValues.value = {
        image: imageUrl, // ← عمداً URL می‌ذاریم (نه File) تا initialImages کار کند
        service: String(p.service ?? "0"),
        title: p.title ?? "",
        titleInLatin: p.titleInLatin ?? p.slug ?? "",
        meta: Array.isArray(p.meta) ? p.meta : [],
        summary: p.summary ?? "",
        fullText: p.fullText ?? "",
        faq: Array.isArray(p.faq) ? p.faq : [],
      };
    }
  } catch (err) {
    console.error(err);
    $notifyDanger("خطا در دریافت داده‌ها");
  } finally {
    formConfig.formProps.loading = false;
  }
}

onBeforeMount(fetchData);

async function onSubmitForm(values) {
  try {
    formConfig.submitButton.pending = true;

    const fd = new FormData();
    fd.append("title", values.title || "");
    fd.append("titleInLatin", values.titleInLatin || "");
    fd.append("service", values.service || "0");
    fd.append("summary", values.summary || "");
    fd.append("fullText", values.fullText || "");
    fd.append("meta", JSON.stringify(values.meta || []));
    fd.append("faq", JSON.stringify(values.faq || []));

    // اگر کاربر فایل جدیدی انتخاب کرده بود، همون رو بفرست
    const img = Array.isArray(values.image) ? values.image[0] : values.image;
    if (img instanceof File) {
      fd.append("image", img);
    }
    // اگر File نبود (یعنی URL قبلیه)، چیزی برای image نفرست که سرور همون قبلی رو نگه داره

    const res = await apiProject.request(`projects/${route.params.id}`, {
      method: "put",
      data: fd,
    });

    if (res?.value?.status) {
      $notifySuccess(res.value.message || "ذخیره شد");
      navigateTo("../");
    } else {
      $notifyDanger(res?.value?.message || "خطا در ذخیره");
    }
  } catch (e) {
    console.error(e);
    $notifyDanger("خطا در ثبت تغییرات");
  } finally {
    formConfig.submitButton.pending = false;
  }
}
</script>
