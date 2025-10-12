<!-- pages/blog/add-with-formbuilder.vue -->
<script setup lang="js">
const { request } = useApi();
const { $notifyDanger, $notifySuccess } = useNuxtApp();

function formatDateTime(date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 16);
}
function stripHtml(html = "") {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "").trim();
}

const initialValues = reactive({
  image: null,
  title: "",
  titleInLatin: "",
  source: "",
  timeToRead: "",
  tags: [],
  summary: "",
  fullText: "",
  scheduleFlag: false,
  publicationDate: formatDateTime(new Date()),
  faqs: [],
});

const config = reactive({
  formProps: {
    title: " ",
    columns: { base: 1, md: 2 },
    disabledAll: false,
    loading: false,
    loadingMode: "skeleton",
    showErrorsAs: "inline",
    autoSaveKey: "blogAddForm",
  },
  sections: [
    {
      title: "",
      collapsible: false,
      fields: [
        // تصویر (اجباری) با ImageUploader
        {
          key: "image",
          type: "file",
          label: "عکس :",
          isImageUploader: true,     // ← این کلید
          multipleFile: false,
          maxFiles: 1,
          sizeClass:'md:w-auto w-full md:h-[40vh]',
          accept: "image/webp,image/jpeg,image/png,image/gif",
          aspectRatio: "3/2",
          watermark: true,          // اگر خواستی true کن
          layout: { colSpan: { base: 1, md: 2 } },
          validators: [{ type: "required", message: "عکس مقاله الزامی است." }],
        },

        // عنوان (اجباری)
        {
          key: "title",
          type: "text",
          label: "عنوان :",
          placeholder: "",
          validators: [
            { type: "required", message: "عنوان الزامی است." },
            { type: "minLength", value: 2, message: "حداقل ۲ کاراکتر." },
            { type: "maxLength", value: 255, message: "حداکثر ۲۵۵ کاراکتر." },
          ],
        },

        // عنوان لاتین (اجباری + regex لاتین)
        {
          key: "titleInLatin",
          type: "text",
          label: "عنوان لاتین :",
          placeholder: "",
          validators: [
            { type: "required", message: "عنوان لاتین الزامی است." },
            {
              type: "regex",
              pattern: "^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$",
              message: "فقط حروف و اعداد لاتین و خط تیره مجاز است.",
            },
            { type: "maxLength", value: 255, message: "حداکثر ۲۵۵ کاراکتر." },
          ],
        },

        // نویسنده/منبع (اجباری)
        {
          key: "source",
          type: "text",
          label: "منبع/نویسنده :",
          placeholder: "",
          validators: [{ type: "required", message: "نام نویسنده/منبع الزامی است." }],
        },

        // زمان مطالعه (اختیاری)
        {
          key: "timeToRead",
          type: "text",
          label: "زمان مطالعه :",
          placeholder: "",
        },

        // تگ‌ها
        {
          key: "tags",
          type: "tags",
          label: "برچسب‌ها",
          placeholder: "",
          minItems: 0,
          maxItems: 50,
          layout:{
            colSpan:{base:1,md:2}
          }
        },

        // خلاصه (اجباری) — لیبل از بالا
        {
          key: "summary",
          type: "textarea",
          label: "خلاصه :",
          tooltip: "خلاصه به عنوان meta description هم استفاده میشود",
          labelPosition: { base: "top" },        // ← لیبل بالا
          layout: { colSpan: { base: 1, md: 2 } },
          validators: [
            { type: "required", message: "خلاصه الزامی است." },
            {
              type: "custom",
              message: "خلاصه باید یک پاراگراف و کمتر از 250 کاراکتر باشد.",
              validator: (val) => {
                const text = stripHtml(val || "");
                const pCount = (val?.match(/<p[\s>]/gi) || []).length;
                return pCount <= 1 && text.length <= 250;
              },
            },
          ],
        },

        // متن اصلی (اجباری)
        {
          key: "fullText",
          type: "richtext",
          label: "توضیحات :",
          layout: { colSpan: { base: 1, md: 2 } },
          labelPosition:{base:'top'},
          validators: [{ type: "required", message: "متن مقاله الزامی است." }],
        },

    

        // FAQ
        {
          key: "faqs",
          type: "array",
          label: "سوالات متداول",
          itemFields: [
            { key: "question", type: "richtext", label: "سوال" },
            { key: "answer", type: "richtext", label: "پاسخ" },
          ],
          minItems: 0,
          maxItems: 50,
          layout: { colSpan: { base: 1, md: 2 } },
        },
            // زمان‌بندی
        { key: "scheduleFlag", type: "toggle", label: "زمانبندی انتشار" },
        {
          key: "publicationDate",
          type: "datetime",
          label: "زمان انتشار :",
          inputFormat: "YYYY-MM-DDTHH:mm",
          displayFormat: "YYYY-MM-DDTHH:mm",
          single: true,
          clearable: false,
          showIf: (v) => !!v.scheduleFlag,
          validators: [
            {
              type: "custom",
              message: "زمان انتشار نمی‌تواند گذشته باشد.",
              validator: (val) => !val || new Date(val).getTime() >= Date.now() - 60 * 1000,
            },
          ],
        },
      ],
    },
  ],
  submitButton: {
    text: "ثبت",
    pending: false,
    color: "primary-100",
    size: "lg",
    fullWidth: true,
    rounded: "lg",
  },
});

onMounted(() => {
  config.formProps.loading = false
});

async function submitForm(values) {
  // خلاصه: یک پاراگراف و ≤۲۵۰
  const pCount = (values.summary?.match(/<p[\s>]/gi) || []).length;
  const plain = stripHtml(values.summary || "");
  if (pCount > 1 || plain.length > 250) {
    return $notifyDanger("خلاصه باید یک پاراگراف و کمتر از 250 حرف باشد.");
  }

  config.submitButton.pending = true;
  try {
    const fd = new FormData();
    const dateStr = (values.publicationDate || formatDateTime(new Date()))
      .replace("T", " ") + ":00";

    fd.append("publicationDate", dateStr);
    fd.append("title", values.title || "");
    fd.append("titleInLatin", values.titleInLatin || "");
    fd.append("summary", values.summary || "");
    fd.append("fullText", values.fullText || "");
    fd.append("timeToRead", values.timeToRead || "");
    fd.append("source", values.source || "");

    const tags = (values.tags || []).map(t => (typeof t === "string" ? t : t?.value || "")).filter(Boolean);
    fd.append("tags", JSON.stringify(tags));
debugger
    const img = Array.isArray(values.image) ? values.image[0] : values.image;
    if (img) fd.append("image", img);

    const res = await request("articles", { method: "post", data: fd });

    if (res?.value?.status) {
      // اگر لازم شد، اینجا FAQها رو هم ارسال کن
      $notifySuccess(res.value.message || "ثبت شد");
      return navigateTo("../blog");
    }
    $notifyDanger(res?.value?.message || "خطا در ثبت");
  } catch {
    $notifyDanger("مشکلی پیش آمد.");
  } finally {
    config.submitButton.pending = false;
  }
}

/* بخش AI فعلاً غیرفعال */
// // const client = new OpenAI({...})
// // const nameIsGet = ref(false);
// // async function generateSlug() { ... }
</script>

<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-6 mb-2">
          <Header>اضافه کردن مقاله</Header>
          <NuxtLink
            to="/drafts"
            class="text-sm md:text-base px-3 py-2 rounded-lg bg-primary-100 text-center text-white"
          >
            لیست پیش‌نویس‌ها
          </NuxtLink>
        </div>

        <FormBuilder
          :config="config"
          :initialValues="initialValues"
          @submitForm="submitForm"
        />
      </Box>
    </template>
  </NuxtLayout>
</template>
