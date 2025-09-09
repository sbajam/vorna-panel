<script setup>
const { pending, error, data, request } = useApi();
const { $toast } = useNuxtApp();

// Data
const rawData = ref([]); // اطلاعات خام از API
const filteredData = ref([]); // اطلاعات فیلتر شده نهایی
const isLoading = ref(true);

// Filters
const searchTerm = ref("");
const verificationStatus = ref("همه");
const verificationOptions = ref(["همه", "احراز هویت شده", "احراز هویت نشده"]);
const activeStatus = ref("فعال");
const activeStatusOptions = ref(["همه", "فعال", "معلق"]);

// Columns tuned for SmartTable (with raw HTML link mode)
const columns = ref([
  { key: "index", label: "شماره", type: "number" },
  { key: "name", label: "نام فروشگاه", type: "text" },
  { key: "work_subject", label: "حوزه کاری", type: "text", shrink: true },
  { key: "count_day", label: "پنل(روز)", type: "number" },
  { key: "phone_number", label: "شماره تلفن", type: "text" },
  // link with raw HTML enabled via safe:false (v-html inside SmartTable)
  {
    key: "url",
    label: "url",
    type: "link",
    basePath: "http://vendow.ir/",
    safe: false,
    shrink: true,
  },
  // { key: "uuid", label: "دستگاه شماره‌گیر", type: "text" },
  {
    key: "verified",
    label: "احراز هویت",
    type: "badge",
    map: { true: " شده", false: "نشده" },
  },
  {
    key: "active",
    label: "وضعیت",
    type: "badge",
    map: { false: "معلق", true: "فعال" },
  },
]);

// تبدیل داده‌های خام به فرمت مورد نظر
const transformData = (item) => ({
  id: item.id,
  name: item.name,
  work_subject: item.work_subject || "",
  count_day: item.count_day,
  phone_number: item.phone_number,
  url: item.url,
  uuid: item.uuid || "ندارد",
  verified: item.verified,
  active: !item.pending,
});

// فیلتر کردن داده‌ها بر اساس تمام فیلترها
const filterData = () => {
  if (!rawData.value.length) return [];

  return rawData.value
    .filter((store) => {
      let matchesSearch =
        searchTerm.value === "" ||
        String(store.work_subject || "")
          .toLowerCase()
          .includes(searchTerm.value.toLowerCase()) ||
        String(store.name || "")
          .toLowerCase()
          .includes(searchTerm.value.toLowerCase());
      let matchesVerification =
        verificationStatus.value === "همه" ||
        (verificationStatus.value === "احراز هویت شده"
          ? store.verified
          : !store.verified);

      let matchesActive =
        activeStatus.value === "همه" ||
        (activeStatus.value === "فعال" ? !store.pending : store.pending);

      return matchesSearch && matchesVerification && matchesActive;
    })
    .map(transformData);
};

// دریافت داده‌ها از API
const fetchData = async () => {
  isLoading.value = true;
  try {
    const response = await request("/admins/store", {
      headers: { "Cache-Control": "no-cache" },
      baseUrl: "https://api.vendow.ir",
    });

    if (!response.status) {
      $toast.show({
        type: "danger",
        class: "backToast",
        message: response.message,
      });
      return;
    }

    rawData.value = response.body;
    filteredData.value = filterData();
  } catch (err) {
    $toast.show({
      type: "danger",
      class: "backToast",
      message: "مشکلی پیش آمد.",
    });
  } finally {
    isLoading.value = false;
  }
};

// واکنش به تغییرات فیلترها
watch(
  [searchTerm, verificationStatus, activeStatus],
  () => {
    console.log("change");
    filteredData.value = filterData();
  },
  { deep: true }
);

const suspend = async (shop) => {
  isLoading.value = true;
  try {
    const response = await request(`/admins/store/${shop.id}`, {
      method: "patch",
      data: {},
      headers: { "Cache-Control": "no-cache" },
      baseUrl: "https://api.vendow.ir",
    });

    $toast.show({
      type: response.status ? "success" : "danger",
      class: "backToast",
      message: response.message,
    });

    if (response.status) fetchData();
  } catch (err) {
    $toast.show({
      type: "danger",
      class: "backToast",
      message: "مشکلی پیش آمد.",
    });
  } finally {
    isLoading.value = false;
  }
};

// اجرای اولیه
onBeforeMount(() => {
  fetchData();
});
</script>

<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box>
        <Header>فروشگاه ها</Header>

        <div class="flex flex-wrap items-center justify-between mb-4">
          <div
            class="grid lg:grid-cols-2 w-full lg:w-6/12 pb-4 lg:pb-0 lg:pl-4 items-center gap-4 whitespace-nowrap"
          >
            <DropDown
              :items="verificationOptions"
              v-model="verificationStatus"
              class="!p-0"
            >
            </DropDown>
            <DropDown
              :items="activeStatusOptions"
              v-model="activeStatus"
              class="!p-0"
            >
            </DropDown>
          </div>
             <div class=" flex-nowrap w-full  lg:w-6/12 flex items-center gap-0 relative justify-around">

            
            <InputField
              v-model="searchTerm"
              placeholder="جستجو "
              type="text"
              class="w-full !p-0"
           
              />
              <button class="absolute left-1 lg:left-9 top-1/2 -translate-y-1/2 text-xs lg:text-xl px-2 text-center flex items-center justify-center bg-primary-100 text-white rounded-full aspect-square hover:bg-primary-dark transition-colors">
              <Icon name="fa6-solid:magnifying-glass" />
            </button>
          </div>
        </div>

        <SmartTable
          :data="filteredData"
          :columns="columns"
          :actions="[
            { icon: 'fa6-solid:info', tooltip: 'بررسی', emit: 'check' },
            { icon: 'fa6-solid:ban', tooltip: 'تعلیق / فعال', emit: 'suspend' },
          ]"
          :loading="isLoading"
          :error="false"
          :sortable="true"
          :excel="true"
          :excelOptions="{
            filename: 'stores.xlsx',
            useRawData: false,
            columns: [
              'name',
              'work_subject',
              'phone_number',
              'url',
              'verified',
              'active',
            ],
          }"
          :rowClickable="false"
          :emptyText="
            searchTerm || verificationStatus !== 'همه' || activeStatus !== 'همه'
              ? 'هیچ نتیجه‌ای با فیلترهای انتخاب شده یافت نشد.'
              : 'موردی برای نمایش وجود ندارد.'
          "
          stickyHeader
          @refresh="fetchData"
          @suspend="suspend"
          @check="
            (e) => {
              navigateTo(`../stores/${e.id}-check`);
            }
          "
        />
      </Box>
    </template>
  </NuxtLayout>
</template>
