<script setup lang="js">
const route = useRoute();
const { $notifyDanger, $notifySuccess } = useNuxtApp();

// دو نمونه‌ی جدا از useApi تا نتیجه‌ها قاطی نشن
const apiGet = useApi();
const apiSave = useApi();

function formatDateTime(date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 16);
}
function stripHtml(html = "") {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "").trim();
}

// مقدارهای اولیه (برای رندر اول و در صورت نبودن id / خطا)
const initialValues = ref({
  image: null,                 // ← این می‌تونه بعد از fetch یک URL بشه تا پیش‌نمایش بده
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
    title: "",
    columns: { base: 1, md: 2 },
    disabledAll: false,
    loading: true,
    loadingMode: "skeleton",
    showErrorsAs: "inline",
  },
  sections: [
    {
      title: "",
      collapsible: false,
      fields: [
        {
          key: "image",
          type: "file",
          label: "عکس :",
          isImageUploader: true,
          multipleFile: false,
          maxFiles: 1,
          sizeClass: "md:w-auto w-full md:h-[40vh]",
          accept: "image/webp,image/jpeg,image/png,image/gif",
          aspectRatio: "3/2",
          watermark: true,
          layout: { colSpan: { base: 1, md: 2 } },
          validators: [{ type: "required", message: "عکس مقاله الزامی است." }],
        },
        {
          key: "title",
          type: "text",
          label: "عنوان :",
          validators: [
            { type: "required", message: "عنوان الزامی است." },
            { type: "minLength", value: 2, message: "حداقل ۲ کاراکتر." },
            { type: "maxLength", value: 255, message: "حداکثر ۲۵۵ کاراکتر." },
          ],
        },
        {
          key: "titleInLatin",
          type: "text",
          label: "عنوان لاتین :",
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
        {
          key: "source",
          type: "text",
          label: "منبع/نویسنده :",
          validators: [{ type: "required", message: "نام نویسنده/منبع الزامی است." }],
        },
        { key: "timeToRead", type: "text", label: "زمان مطالعه :" },
        {
          key: "tags",
          type: "tags",
          label: "برچسب‌ها",
          layout: { colSpan: { base: 1, md: 2 } },
          minItems: 0, maxItems: 50,
        },
        {
          key: "summary",
          type: "textarea",
          label: "خلاصه :",
          labelPosition: { base: "top" },
          tooltip: "خلاصه به عنوان meta description هم استفاده میشود",
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
        {
          key: "fullText",
          type: "richtext",
          label: "توضیحات :",
          labelPosition: { base: "top" },
          layout: { colSpan: { base: 1, md: 2 } },
          validators: [{ type: "required", message: "متن مقاله الزامی است." }],
        },
        {
          key: "faqs",
          type: "array",
          label: "سوالات متداول",
          itemFields: [
            { key: "question", type: "richtext", label: "سوال" },
            { key: "answer", type: "richtext", label: "پاسخ" },
          ],
          minItems: 0, maxItems: 50,
          layout: { colSpan: { base: 1, md: 2 } },
        },
        { key: "scheduleFlag", type: "toggle", label: "زمانبندی انتشار" },
        {
          key: "publicationDate",
          type: "datetime",
          label: "زمان انتشار :",
          inputFormat: "YYYY-MM-DDTHH:mm",
          displayFormat: "YYYY-MM-DDTHH:mm",
          single: true, clearable: false,
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

// --- فچ مقاله و پر کردن initialValues (با URL تصویر برای پیش‌نمایش) ---
async function fetchArticle() {
  try {
    config.formProps.loading = true;
    const id = route.params.id;
    if (!id) {
      // حالت «افزودن مقاله» — همون initialValues پیش‌فرض می‌مونه
      return;
    }

    const res = await apiGet.request(`articles/${id}`);
    if (res?.value?.status) {
      const a = res.value.body || {};

      // تشخیص فیلد URL تصویر طبق API: یکی از این‌ها رو درست کن
      const imageUrl = a.image || a.imageUrl || a.cover || "";

      initialValues.value = {
        image: imageUrl || null, // ← URL برای پیش‌نمایش (FileField → ImageUploader)
        title: a.title ?? "",
        titleInLatin: a.titleInLatin ?? a.slug ?? "",
        source: a.source ?? "",
        timeToRead: a.timeToRead ?? "",
        tags: Array.isArray(a.tags) ? a.tags : [],         // اگر API آرایه‌ی رشته می‌ده، مستقیم OK
        summary: a.summary ?? "",
        fullText: a.fullText ?? "",
        scheduleFlag: !!a.scheduleFlag,
        publicationDate: a.publicationDate
          ? formatDateTime(new Date(a.publicationDate))
          : formatDateTime(new Date()),
        faqs: Array.isArray(a.faqs) ? a.faqs : [],
      };
    } else {
      $notifyDanger(res?.value?.message || "خطا در دریافت مقاله");
    }
  } catch (e) {
    console.error(e);
    $notifyDanger("مشکلی در دریافت مقاله پیش آمد");
  } finally {
    config.formProps.loading = false;
  }
}

onBeforeMount(fetchArticle);

// --- ارسال فرم ---
async function submitForm(values) {
  // ولیدیشن خلاصه: یک پاراگراف و ≤۲۵۰
  const pCount = (values.summary?.match(/<p[\s>]/gi) || []).length;
  const plain = stripHtml(values.summary || "");
  if (pCount > 1 || plain.length > 250) {
    return $notifyDanger("خلاصه باید یک پاراگراف و کمتر از 250 حرف باشد.");
  }

  config.submitButton.pending = true;
  try {
    const fd = new FormData();
    const dateStr =
      (values.publicationDate || formatDateTime(new Date())).replace("T", " ") +
      ":00";

    fd.append("publicationDate", dateStr);
    fd.append("title", values.title || "");
    fd.append("titleInLatin", values.titleInLatin || "");
    fd.append("summary", values.summary || "");
    fd.append("fullText", values.fullText || "");
    fd.append("timeToRead", values.timeToRead || "");
    fd.append("source", values.source || "");

    // نرمال‌سازی تگ‌ها به آرایه‌ی رشته و سپس JSON
    const tags = (values.tags || [])
      .map((t) => (typeof t === "string" ? t : t?.value || ""))
      .filter(Boolean);
    fd.append("tags", JSON.stringify(tags));

    // تصویر: فقط اگر فایل جدید است ارسال کن
    const img = Array.isArray(values.image) ? values.image[0] : values.image;
    if (img instanceof File) {
      fd.append("image", img);
    }

    // FAQ ها اگر نیاز به ارسال جدا ندارند، همین‌جا JSON کنید
    fd.append("faqs", JSON.stringify(values.faqs || []));

    const id = route.params.id;
    const url = id ? `articles/${id}` : "articles";
    const method = id ? "post" /* یا 'put'/'patch' بسته به API */ : "post";

    const res = await apiSave.request(url, { method, data: fd });

    if (res?.value?.status) {
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
</script>

<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-6 mb-2">
          <Header>{{ route.params.id ? "ویرایش مقاله" : "افزودن مقاله" }}</Header>
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
