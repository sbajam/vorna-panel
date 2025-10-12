<script setup>
import MultiRangeSlider from "multi-range-slider-vue";

// Composables
const { request, data, pending } = useApi();
const { $notifyDanger } = useNuxtApp();
// State
const dataArray = ref([]);
const minYear = ref(1300);
const maxYear = ref(1403);
const min = ref(1300);
const max = ref(1403);
const genderCheck = ref("همه");
const selectAll = ref(false);

const modalState = reactive({
  sms: false,
  import: false,
  credit: false,
});

const accountInfo = reactive({
  credit: 5000,
  smsPrice: 5000,
});

// Constants
const GENDER_OPTIONS = ["همه", "زن", "مرد", "بدون جنسیت"];

const tableColumns = [
  { label: "انتخاب", key: "selected", type: "checkbox" },
  { label: "شماره", key: "index" },
  { label: "شماره موبایل", key: "phone_number" },
  { label: "جنسیت", key: "gender" },
  { label: "سال تولد", key: "year_birth" },
];

// Computed
const filteredCustomers = computed(() => {
  if (!dataArray.value) return [];

  let result = [...dataArray.value];

  // Apply gender filter
  if (genderCheck.value !== "همه") {
    if (genderCheck.value === "بدون جنسیت") {
      result = result.filter((item) => !item?.gender);
    } else {
      result = result.filter((item) => item?.gender === genderCheck.value);
    }
  }

  // Apply year range filter
  result = result.filter((item) => {
    if (!item?.year_birth) return true;
    return item.year_birth >= min.value && item.year_birth <= max.value;
  });

  return result;
});

const selectedCustomers = computed(() => {
  return filteredCustomers.value.filter((c) => c.selected);
});

// Methods
async function fetchData() {
  try {
    await request("phone_numbers");

    if (data.value?.status) {
      const { phones, credit: accountCredit, smsprice } = data.value.body;

      // Update account info
      accountInfo.credit = Number(accountCredit || 0);
      accountInfo.smsPrice = smsprice.price;

      // Process customer data
      const processedData = phones.map((phone) => ({
        selected: false,
        id: phone.id,
        phone_number: phone.phone_number,
        gender: !phone.gender ? null : phone.gender === "1" ? "مرد" : "زن",
        year_birth: phone.year_birth ? parseInt(phone.year_birth) : null,
      }));

      // Find min/max years
      updateYearRange(processedData);

      // Update data
      dataArray.value = processedData;
    } else {
      throw new Error(data.value?.message || "خطا در دریافت اطلاعات");
    }
  } catch (error) {
    $notifyDanger(
      error instanceof Error ? error.message : "خطا در دریافت اطلاعات"
    );
  }
}

function updateYearRange(data) {
  // Reset range
  minYear.value = 1300;
  maxYear.value = 1403;

  // Find min/max from data
  const years = data
    .map((item) => item.year_birth)
    .filter((year) => year !== null);

  if (years.length > 0) {
    minYear.value = Math.min(...years);
    maxYear.value = Math.max(...years);

    // Adjust if min equals max
    if (minYear.value === maxYear.value) {
      minYear.value--;
      maxYear.value++;
    }
  }

  // Update current selection
  min.value = minYear.value;
  max.value = maxYear.value;
}

function handleYearRangeChange(event) {
  min.value = event.minValue;
  max.value = event.maxValue;
}

function handleGenderChange(gender) {
  genderCheck.value = gender;
}

function handleSelection(index) {
  if (index === -1) {
    // Toggle select all
    selectAll.value = !selectAll.value;
    filteredCustomers.value.forEach((item) => {
      item.selected = selectAll.value;
    });
    return;
  }

  // Toggle individual selection
  const item = filteredCustomers.value[index];
  if (item) {
    item.selected = !item.selected;

    // Update selectAll state
    if (!item.selected) {
      selectAll.value = false;
    } else {
      selectAll.value = filteredCustomers.value.every((c) => c.selected);
    }
  }
}

function handleSendSMS() {
  if (!selectedCustomers.value.length) {
    return $notifyDanger("شما هیچ شماره‌ای را انتخاب نکردید");
  }
  modalState.sms = true;
}

async function downloadExcel() {
  try {
    const response = await request("exportphonenumbersexcel");
    // if (!response.ok) {
    //   throw new Error(response.value?.message || "خطا در دریافت فایل");
    // }

    // Create blob from response
    const blob = new Blob([response.value], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);

    // Trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = "customers.xlsx";
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.log(error);
    $notifyDanger(error instanceof Error ? error.message : "مشکلی پیش آمد");
  }
}

// Lifecycle hooks
onMounted(() => {
  fetchData();
});
</script>
<template>
  <NuxtLayout name="admin">
    <template #main>
      <ImportExcel
        v-if="modalState.import"
        @close="modalState.import = false"
        :options="{
          route: 'addphonenumbersbyexcel',
          method: 'post',
          nameFile: '',
          file: 'vendow-customers-add.xlsx',
          text: 'مطابق جدول نمونه برای اضافه شدن شماره تلفن فایل را پر کرده و بارگذاری نمایید',
        }"
        @success="fetchData"
      />

      <Sms
        v-if="modalState.sms"
        @close="modalState.sms = false"
        :customers="selectedCustomers"
        @open-credit="modalState.credit = true"
        :credit="accountInfo.credit"
        :smsPrice="accountInfo.smsPrice"
      />

      <CreditModal
        v-if="modalState.credit"
        @close="modalState.credit = false"
        @success="fetchData"
      />

      <Box>
        <div
          class="flex flex-col md:flex-row md:items-center justify-between mb-8"
        >
          <Header>مشتریان</Header>
          <div v-if="!pending" class="flex items-center gap-4">
            <div class="text-lg">
              شارژ حساب:
              <span class="font-bold text-secondary">
                {{
                  new Intl.NumberFormat("fa-IR").format(
                    Number(accountInfo.credit)
                  )
                }}
                تومان
              </span>
            </div>
            <Button
              color="secondary-100"
              icon="fa6-solid:wallet"
              @click="modalState.credit = true"
            >
              شارژ حساب پیامکی
            </Button>
          </div>
        </div>

        <Spinner v-if="pending" />

        <template v-else>
          <div class="flex flex-col md:flex-row items-start gap-6 mb-6">
            <div class="w-full md:w-1/3">
              <DropDown
                :items="GENDER_OPTIONS"
                v-model="genderCheck"
                @update:modelValue="handleGenderChange"
                placeholder="فیلتر بر اساس جنسیت"
              />
            </div>

            <div class="w-full md:w-2/3">
              <MultiRangeSlider
                :min="minYear"
                :max="maxYear"
                :step="1"
                :ruler="false"
                :label="true"
                :minValue="min"
                :maxValue="max"
                @input="handleYearRangeChange"
                class="range-slider"
              />
            </div>
          </div>

          <div class="grid lg:grid-cols-2 gap-4 mb-6">
            <Button
              color="primary-100"
              :full-width="true"
              icon="fa6-solid:file-export"
              @click="downloadExcel"
            >
              دریافت خروجی Excel
            </Button>
            <Button
              color="secondary-100"
              :full-width="true"
              icon="fa6-solid:file-import"
              @click="modalState.import = true"
            >
              افزودن از فایل Excel
            </Button>
          </div>
          <SmartTable
            :data="filteredCustomers"
            :columns="tableColumns"
            :loading="pending"
            :selected="selectAll"
            @select="handleSelection"
            class="mb-6"
          >
            <template #selected="{ item }">
              <input
                type="checkbox"
                :checked="item.selected"
                @change.prevent.stop="() => handleSelection(filteredCustomers.indexOf(item))"
              />
            </template>

            <template #gender="{ item }">
              <span
                :class="
                  item.gender === 'مرد' ? 'text-blue-600' : 'text-pink-600'
                "
              >
                {{ item.gender }}
              </span>
            </template>
          </SmartTable>

          <div class="flex justify-end mt-6">
            <Button
              color="primary-100"
              :full-width="true"
              icon="fa6-solid:paper-plane"
              :disabled="!selectedCustomers.length"
              @click="handleSendSMS"
            >
              ارسال پیامک به {{ selectedCustomers.length }} مشتری
            </Button>
          </div>
        </template>
      </Box>
    </template>
  </NuxtLayout>
</template>
<style lang="scss">
.multi-range-slider {
  @apply shadow-none border-0;
  direction: ltr;

  .bar-inner {
    @apply bg-secondary-100 border-0;
  }

  .bar-inner,
  .bar-left,
  .bar-right {
    @apply shadow-lg;
    // box-shadow:0px 0px 5px black;
  }

  .thumb::before {
    @apply border-2 border-primary-100 shadow-none;
  }

  .thumb .caption {
    @apply flex;

    * {
      @apply bg-primary-100 shadow-md;
    }
  }
}
</style>
