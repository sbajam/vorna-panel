<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box>
        <h2 class="text-2xl font-bold text-primary mb-4">
          مجموعه وندو همراه شماست!
        </h2>
        <div class="flex flex-col mt-2 gap-8">
          <!-- <h1 class="header">درخواست خدمات جدید</h1>  -->
          <DropDown
            :items="[
              { id: '', name: 'مدیریت وبسایت' },
              { id: 'domain-redirect', name: 'ریدایرکت دامنه شخصی' },
              { id: 'domain-setup', name: 'اجرا سایت روی دامنه اختصاصی' },
              {
                id: 'gsc-setup',
                name: 'تنظیم Google Search Console دامنه اختصاصی',
              },
              { id: 'set-enamad', name: 'بارگذاری فایل اینماد' },
              { id: 'business-coaching', name: 'کوچینگ کسب و کار' },
              { id: 'instagram', name: 'مشاوره پیج اینستاگرام' },
              {
                id: 'graphic-and-design',
                name: 'طراحی بنر و کاور و خدمات گرافیکی',
              },
              {
                id: 'set-map-location',
                name: 'ثبت موقعیت کسب و کار در نقشه',
              },
              { id: 'others', name: 'متفرقه' },
            ]"
            v-model="title"
            label="درخواست"
            value-field="."
            label-field="name"
            class="mt-4"
            label-position="top"
          />

          <InputField
            type="textarea"
            label="درباره انتظارات و درخواست خود توضیح دهید"
            name="text"
            class="mt-4"
            v-model="text"
            id="text"
            label-position="top"
          ></InputField>

          <Button
            size="lg"
            color="primary-100"
            :fullWidth="true"
            rounded="lg"
            :pending="pending"
            @click="submit()"
            class="mt-6"
          >
            ثبت پیام
          </Button>
        </div>
        <p class="my-4">
          علاوه بر ارائه خدمات حرفه‌ای در زمینه
          <span class="font-semibold">ساخت وب‌سایت</span>، ما در سایر حوزه‌های
          مهم کسب‌وکار نیز کنار شما هستیم. اگر به دنبال رشد کسب‌وکار و حضور
          قوی‌تر در فضای آنلاین هستید، ما راه‌حل‌های تخصصی برای شما داریم.
        </p>
        <ul class="list-disc pl-5 space-y-2 mb-6">
          <li class="text-sm mt-4 text-justify">
            <span class="font-semibold text-blue-500 tex-lg block"
              >مدیریت وب‌سایت:</span
            >
            مدیریت حرفه‌ای وب‌سایت شامل به‌روزرسانی محصولات، بررسی سبد خرید
            مشتریان، طراحی کمپین‌های بازاریابی و بهینه‌سازی فرآیندهای فروش.
            <NuxtLink
              to="https://vendow.ir/blog/services-website-management"
              targetedit
              class="text-primary underline font-semibold"
              >مشاهده راهنمای کامل</NuxtLink
            >
          </li>

          <li class="text-sm mt-4 text-justify">
            <span class="font-semibold text-blue-500 tex-lg block"
              >کوچینگ کسب‌وکار:</span
            >
            ارائه مشاوره تخصصی برای رشد پایدار، اصلاح فرآیندها و ایجاد
            استراتژی‌های مؤثر جهت افزایش درآمد.
            <!-- <NuxtLink to="/link-to-article" targetedit class="text-primary underline font-semibold">جزئیات بیشتر در راهنمای تخصصی</NuxtLink> -->
          </li>

          <li class="text-sm mt-4 text-justify">
            <span class="font-semibold text-blue-500 tex-lg block"
              >مدیریت پیج اینستاگرام:</span
            >
            مدیریت جامع پیج شامل انتشار محتوای حرفه‌ای (پست و استوری)، پاسخگویی
            به کاربران، افزایش تعامل و بهینه‌سازی روند فعالیت پیج.
            <!-- <NuxtLink to="/link-to-article" targetedit class="text-primary underline font-semibold">آموزش مرحله‌به‌مرحله</NuxtLink> -->
          </li>

          <li class="text-sm mt-4 text-justify">
            <span class="font-semibold text-blue-500 tex-lg block"
              >طراحی بنر، کاور و خدمات گرافیکی:</span
            >
            طراحی خلاقانه و حرفه‌ای بنرها، کاورها و المان‌های گرافیکی جهت تقویت
            هویت بصری برند و جذب مخاطبان.
            <!-- <NuxtLink to="/link-to-article" targetedit class="text-primary underline font-semibold">مشاهده مستندات رسمی</NuxtLink> -->
          </li>

          <li class="text-sm mt-4 text-justify">
            <span class="font-semibold text-blue-500 tex-lg block"
              >ثبت موقعیت کسب‌وکار در نقشه:</span
            >
            ثبت و بهینه‌سازی موقعیت کسب‌وکار در نقشه‌های دیجیتال برای دسترسی
            آسان‌تر مشتریان.
            <NuxtLink
              to="https://vendow.ir/blog/business-location-map-service"
              targetedit
              class="text-primary underline font-semibold"
              >دریافت دستورالعمل گام‌به‌گام</NuxtLink
            >
          </li>

          <li class="text-sm mt-4 text-justify">
            <span class="font-semibold text-blue-500 tex-lg block"
              >ریدایرکت دامنه شخصی:</span
            >
            پس از خرید دامنه و تنظیم NameServer روی مقادیر اعلام‌شده، می‌توانید
            درخواست خود را ثبت کنید تا تیم ما عملیات ریدایرکت را به صورت کامل
            انجام دهد.
            <NuxtLink
              to="https://vendow.ir/blog/domain-redirect-guide"
              targetedit
              class="text-primary underline font-semibold"
              >مشاهده راهنمای کامل</NuxtLink
            >
          </li>

          <li class="text-sm mt-4 text-justify">
            <span class="font-semibold text-blue-500 tex-lg block"
              >اجرا سایت روی دامنه اختصاصی:</span
            >
            پس از خرید دامنه و ست‌کردن NameServerها، مراحل ذکر شده در مقاله
            آموزشی را انجام دهید. سپس با ثبت درخواست، تیم ما سایت شما را روی
            دامنه اختصاصی بررسی و راه‌اندازی خواهد کرد.
            <NuxtLink
              to="https://vendow.ir/blog/domain-setup-guide"
              targetedit
              class="text-primary underline font-semibold"
              >جزئیات بیشتر در راهنمای تخصصی</NuxtLink
            >
          </li>

          <li class="text-sm mt-4 text-justify">
            <span class="font-semibold text-blue-500 tex-lg block"
              >تنظیم Google Search Console دامنه اختصاصی:</span
            >
            برای اتصال دامنه اختصاصی به کنسول جستجوی گوگل، کافی است پس از
            فعال‌سازی دامنه، درخواست خود را ثبت کنید تا تیم ما مراحل اتصال و
            تایید را انجام دهد.
            <NuxtLink
              to="https://vendow.ir/blog/google-search-console-setup"
              targetedit
              class="text-primary underline font-semibold"
              >آموزش مرحله‌به‌مرحله</NuxtLink
            >
          </li>

          <li class="text-sm mt-4 text-justify">
            <span class="font-semibold text-blue-500 tex-lg block"
              >بارگذاری فایل اینماد:</span
            >
            در صورتی که نیاز به بارگذاری فایل اینماد در وب‌سایت دارید، می‌توانید
            درخواست خود را ثبت کنید تا تیم ما فایل مربوطه را در مسیر مناسب
            بارگذاری و تنظیم نماید.
            <NuxtLink
              to="https://vendow.ir/blog/How-to-get-enamad-for-a-store-site"
              targetedit
              class="text-primary underline font-semibold"
              >مشاهده راهنمای کامل</NuxtLink
            >
          </li>

          <li class="text-sm mt-4 text-justify">
            <span class="font-semibold text-blue-500 tex-lg block"
              >متفرقه:</span
            >
            در صورتی که نیاز شما در دسته‌بندی‌های فوق قرار نمی‌گیرد، می‌توانید
            درخواست خود را در این بخش ثبت کنید تا تیم ما آن را بررسی نماید.
          </li>
        </ul>

        <p class="mb-4">
          با ثبت سفارش، تیم ما کسب‌وکار شما را بررسی کرده و در اولین فرصت با شما
          تماس می‌گیرد تا همکاری را شروع کنیم. همچنین، اگر به دنبال راهنمایی
          هستید،
          <a
            href="https://vendow.ir/blog"
            targetedit
            class="text-primary font-semibold underline"
            >وبلاگ وندو</a
          >
          می‌تواند پاسخ‌های مفیدی برای شما داشته باشد.
        </p>

        <!-- </section>
<section class="box">-->
      </Box>
        <Box class="">
        <Header>درخواست‌های شما</Header>
        <!-- Toolbar: Filters/Search + Actions -->
        <div class="flex flex-wrap items-center gap-2"></div>

        <!-- Table -->
        <SmartTable
          class="smart-scroll"
          emptyText="موردی برای نمایش وجود ندارد."
          edit=""
          delete=""
          :data="filteredData"
          :columns="columns"
          :actions="actions"
          :loading="isLoading"
          :error="false"
          :sortable="true"
          :multiSort="false"
          :excel="false"
          :idShow="false"
          :stickyHeader="true"
          :responsive="true"
          :refresh="true"
          @refresh="fetchData"
          :rowClickable="false"
        />
      </Box>
    </template>
  </NuxtLayout>
</template>
<script setup>
let text = ref("");
let title = ref("");
const NORMALIZATION = {
  enabled: true,
  includePaths: null,
  excludePaths: [],
  textOptions: {
    digits: "fa-to-en",
    letters: "ar-to-fa",
    removeTatweel: true,
    removeDiacritics: true,
    removeZWNJ: true,
    collapseSpaces: true,
    trim: true,
  },
};

// Data
const rawData = ref([]);
const filteredData = ref([]);
const isLoading = ref(true);

// Filters
// no searches
// no dropdowns

// Columns/Actions (SmartTable-ready)
const columns = ref([
  {
    key: "index",
    label: "#",
    type: "number",
    sortable: false,
    formatOptions: {
      maximumFractionDigits: 0,
    },
  },
  {
    key: "title",
    label: "نوع درخواست",
    type: "text",
    sortable: true,
    shrink: true,
  },
  {
    key: "text",
    label: "توضیحات",
    type: "text",
    sortable: true,
    shrink: true,
  },
  {
    key: "read",
    label: "وضعیت",
    type: "badge",
    sortable: true,
    map: {
      true: "رسیدگی شده",
      false: "درحال رسیدگی",
    },
  },
  {
    key: "date",
    label: "تاریخ",
    type: "datetime",
    sortable: true,
  },
]);
const actions = ref([]);

const { request, data, pending } = useApi();
const { $notifySuccess, $notifyDanger } = useNuxtApp();
// Transform
function getByPath(obj, path) {
  if (!path) return obj;
  return path
    .split(".")
    .reduce((o, k) => (o ? o[k] : undefined), obj);
}
const transformData = (item) => {
  return item;
};

// Filtering
const filterData = () => {
  let list = rawData.value.slice();
  // normalization (display)
  if (NORMALIZATION.enabled) {
    list = list.map((row) => normalizeAll(row, NORMALIZATION));
  }

  // search(es)
  // no main search
  // no extra searches

  // dropdowns
  // no dropdowns

  filteredData.value = list.map(transformData);
};

// Fetch
const API_CONFIG = {
  path: "serviceqequest",
  pathToList: "data",
};
const fetchData = async () => {
  isLoading.value = true;
  try {
    
    const res = await request(API_CONFIG.path);
    if (!res?.status) {
      $notifyDanger(res?.message || "خطا در دریافت اطلاعات");
      rawData.value = [];
    } else {
      const list = getByPath(res, API_CONFIG.pathToList) ?? res?.body ?? [];
      rawData.value = Array.isArray(list) ? list : [];
    }
    filterData();
  } catch (e) {
    $notifyDanger("مشکلی پیش آمد.");
    rawData.value = [];
    filterData();
  } finally {
    isLoading.value = false;
  }
};

// Watch filters
watch([], filterData, { deep: true });


async function submit() {
  await request("serviceqequest", {
    method: "post",
    data: {
      title: title.value?.name,
      text: text.value,
    },
  });
  if (data.value.status) {
    $notifySuccess(data.value.message);
    title.value = "";
    text.value = "";
    get();
  } else $notifyDanger(data.value.message);
}
onBeforeMount(() => {
  let array = [
    { id: "", name: "مدیریت وبسایت" },
    { id: "domain-redirect", name: "ریدایرکت دامنه شخصی" },
    { id: "domain-setup", name: "اجرا سایت روی دامنه اختصاصی" },
    { id: "gsc-setup", name: "تنظیم Google Search Console دامنه اختصاصی" },
    { id: "set-enamad", name: "بارگذاری فایل اینماد" },
    { id: "business-coaching", name: "کوچینگ کسب و کار" },
    { id: "instagram", name: "مشاوره پیج اینستاگرام" },
    { id: "graphic-and-design", name: "طراحی بنر و کاور و خدمات گرافیکی" },
    { id: "set-map-location", name: "ثبت موقعیت کسب و کار در نقشه" },
    { id: "others", name: "متفرقه" },
  ];
  if (useRoute().query.title) {
    title = array.find((e) => e.id == useRoute().query.title);
  }
  fetchData();
});
</script>
