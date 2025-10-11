<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box class="">
        <Header>نظرات مقالات</Header>
        <!-- Toolbar: Filters/Search + Actions -->
        <div class="flex flex-wrap items-center gap-2">
          <div
            class="flex-nowrap w-full lg:w-6/12 flex items-center gap-0 relative justify-around"
          >
            <InputField
              v-model="searchTerm"
              placeholder="جستجو..."
              type="text"
              class="w-full !p-0"
            />
            <div
              class="absolute left-1 cursor-pointer top-1 bottom-1 text-xs lg:text-xl px-2 text-center flex items-center justify-center bg-primary-100 text-white rounded-xl aspect-square hover:bg-primary-dark transition-colors"
            >
              <Icon name="fa6-solid:magnifying-glass" />
            </div>
          </div>
          <DropDown
            label="وضعیت"
            :items="f_g58t188Options"
            v-model="status"
            class="!p-0"
          />
          <DropDown
            label="نوع نظر"
            :items="f_g58t188Optiodifj"
            v-model="filter"
            class="!p-0"
          />
        </div>
        <!-- Table -->
        <SmartTable
          class="smart-scroll"
          emptyText="موردی برای نمایش وجود ندارد."
          edit="feedbacks"
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
const { request } = useApi();
const { $notifyDanger } = useNuxtApp();

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
const searchTerm = ref("");

const status = ref("همه");
const filter = ref("همه");
const f_g58t188Options = ref(["همه", "منتظر تایید", "تایید شده"]);
const f_g58t188Optiodifj = ref(["همه", "نظر", "پاسخ نظر"]);
const blogNameMap = ref({});

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
    key: "blog.id", // مقدارِ href از این گرفته می‌شود
    label: "مقاله",
    type: "link",
    sortable: true,
    basePath: "../blogs/", // نتیجه: ../blogs/123
    safe: false, // در حالت v-html target="_blank" هم ندارد
    map: blogNameMap.value, // متن لینک → نام مقاله
  },
  {
    key: "email",
    label: "ایمیل",
    type: "text",
    sortable: true,
    shrink: true,
  },

  {
    key: "fullName",
    label: "نام و نام خانوادگی",
    type: "text",
    sortable: true,
    shrink: false,
  },
  {
    key: "date",
    label: "تاریخ",
    type: "text",
    sortable: true,
    shrink: true,
  },
  {
    key: "adminApproval",
    label: "وضعیت",
    type: "badge",
    sortable: true,
    map: {
      true: "تایید شده",
      false: "منتظر تایید",
    },
  },
  {
    key: "text",
    label: "متن",
    type: "text",
    sortable: true,
    shrink: true,
  },
]);
const actions = ref([]);

// Transform
function getByPath(obj, path) {
  if (!path) return obj;
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
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
  {
    const q = makeSearchString(searchTerm.value, NORMALIZATION.textOptions);
    if (q) {
      const fields = [];
      if (fields.length) {
        list = list.filter((row) =>
          fields.some((f) =>
            String(getByPath(row, f) ?? "")
              .toLowerCase()
              .includes(q)
          )
        );
      } else {
        list = list.filter((row) =>
          JSON.stringify(row).toLowerCase().includes(q)
        );
      }
    }
  }
  // no extra searches

  // dropdowns
  // وضعیت (تایید/منتظر تایید)
  {
    const opts = [
      { label: "همه", value: "all" },
      { label: "منتظر تایید", value: false },
      { label: "تایید شده", value: true },
    ];
    const found = opts.find(
      (o) => o.label === status.value || o.value === status.value
    );
    const val = found ? found.value : status.value;

    if (
      !(
        val === undefined ||
        val === null ||
        val === "" ||
        val === "all" ||
        val === "همه"
      )
    ) {
      list = list.filter((row) => row.adminApproval === val);
    }
  }

  // نوع (نظر/پاسخ نظر)
  {
    const opts = [
      { label: "همه", value: "all" },
      { label: "نظر", value: "null" }, // replyTo == null
      { label: "پاسخ نظر", value: "not-null" }, // replyTo != null
    ];
    const found = opts.find(
      (o) => o.label === filter.value || o.value === filter.value
    );
    const val = found ? found.value : filter.value;

    if (
      !(
        val === undefined ||
        val === null ||
        val === "" ||
        val === "all" ||
        val === "همه"
      )
    ) {
      if (val === "null") {
        list = list.filter((row) => row.replyTo == null);
      } else if (val === "not-null") {
        list = list.filter((row) => row.replyTo != null);
      }
    }
  }

  filteredData.value = list.map(transformData);
};

// Fetch
const API_CONFIG = {
  path: "blogcomments",
  pathToList: "data",
};
const fetchData = async () => {
  isLoading.value = true;
  try {
    if (!API_CONFIG) {
      rawData.value = [];
      filterData();
      return;
    }
    const res = await request(API_CONFIG.path, {});
    if (!res?.status) {
      $notifyDanger(res?.message || "خطا در دریافت اطلاعات");
      rawData.value = [];
    } else {
      const list = getByPath(res, API_CONFIG.pathToList) ?? res?.body ?? [];
      rawData.value = Array.isArray(list) ? list : [];
      let c = [];
      for (let p of rawData.value) {
        let tmp = p.comments.map((c) => ({
          ...c,
          blog: { id: p.id, name: p.name },
        }));
        c = c.concat(tmp);
      }
      rawData.value = c;
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
const rebuildblogMap = () => {
  const m = {};
  for (const r of filteredData.value) {
    if (r?.blog?.id != null) m[r.blog.id] = r.blog.name || r.blog.id;
  }
  blogNameMap.value = m;

  // sync به ستون (چون columns یک ref است)
  const col = columns.value.find((c) => c.key === "blog.id");
  if (col) col.map = m;
};

watch(filteredData, rebuildblogMap, { deep: true, immediate: true });

// Watch filters
watch([searchTerm, status, filter], filterData, { deep: true });

onBeforeMount(fetchData);
</script>
