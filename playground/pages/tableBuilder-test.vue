<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box class="">
      <Header>جدول</Header>
        <!-- Toolbar: Filters/Search + Actions -->
        <div class="grid grid-lg:grid-cols-5  flex-wrap items-center gap-2">
          <div class=" lg:col-span-3 flex-nowrap w-full  lg:w-6/12 flex items-center gap-0 relative justify-around">
            <InputField
              v-model="searchTerm"
              placeholder="جستجو..."
              type="text"
              class="w-full !p-0"
           
              />
              <button class="absolute left-1 lg:left-9 top-1/2 -translate-y-1/2 text-xs lg:text-xl px-2 text-center flex items-center justify-center bg-primary-100 text-white rounded-full aspect-square hover:bg-primary-dark transition-colors">
              <Icon name="fa6-solid:magnifying-glass" />
            </button>
          </div>
          <DropDown  :items="f_gfmlrj1Options" v-model="f_gfmlrj1" class="!p-0 lg:col-span-2" />
            <DropDown :items="f_dfl1enzOptions" v-model="f_dfl1enz" class="!p-0 lg:col-span-2" />
          
        </div>

        <!-- Table -->
        <SmartTable
  class="smart-scroll"
  emptyText="موردی برای نمایش وجود ندارد."
  edit=null
  delete=null
    :data="filteredData"
    :columns="columns"
    :actions="actions"
    :loading="isLoading"
    :error="false"
    :sortable=true
    :multiSort=false
    :excel=true
    :idShow=false
    :stickyHeader=true
    :responsive=true
    :refresh=true
    @refresh="fetchData"
    :rowClickable=false
    
    @check="(r: any)=>{/*TODO: implement*/}" @susspend="(r: any)=>{/*TODO: implement*/}" 
  />
      </Box>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">

const { request } = useApi();
const { $notifyDanger } = useNuxtApp();

// Data
const rawData = ref<any[]>([]);
const filteredData = ref<any[]>([]);
const isLoading = ref(true);

// Filters
const searchTerm = ref('');

const f_gfmlrj1 = ref("همه");
const f_gfmlrj1Options = ref(["همه","احراز هویت شده","احراز هویت نشده"]);
const f_dfl1enz = ref("فعال");
const f_dfl1enzOptions = ref(["همه","فعال","معلق"]);

// Columns/Actions (SmartTable-ready)
const columns = ref([
  {
    "key": "id",
    "label": "شماره",
    "type": "number",
    "sortable": true,
    "formatOptions": {
      "maximumFractionDigits": 0
    }
  },
  {
    "key": "name",
    "label": "نام",
    "type": "text",
    "sortable": true
  },
  {
    "key": "work_subject",
    "label": "حوزه کاری",
    "type": "text",
    "sortable": true,
    "shrink": true
  },
  {
    "key": "count_day",
    "label": "روز خریداری شده",
    "type": "number",
    "sortable": true,
    "formatOptions": {
      "maximumFractionDigits": 0
    }
  },
  {
    "key": "phone_number",
    "label": "شماره تماس",
    "type": "text",
    "sortable": true
  },
  {
    "key": "url",
    "label": "url",
    "type": "link",
    "sortable": true,
    "basePath": "https://vendow.ir/",
    "safe": true,
    "shrink": true
  },
  {
    "key": "verified",
    "label": "احراز هویت",
    "type": "badge",
    "sortable": true,
    "map": {
      "true": "شده",
      "false": "نشده"
    }
  },
  {
    "key": "active",
    "label": "فعال/معلق",
    "type": "badge",
    "sortable": true,
    "map": {
      "true": "فعال",
      "false": "معلق"
    }
  }
]);
const actions = ref([
  {
    "icon": "fa6-solid:info",
    "tooltip": "بررسی",
    "emit": "check"
  },
  {
    "icon": "fa6-solid:ban",
    "tooltip": "تعلیق/فعال",
    "emit": "susspend"
  }
]);

// Transform
function getByPath(obj:any, path?:string){
  if(!path) return obj;
  return path.split('.').reduce((o:any,k:string)=> (o? o[k] : undefined), obj);
}
const transformData = (item:any) => {
  return {
id:item.id,
name:item.name,
work_subject:item.work_subject,
count_day:item.count_day,
phone_number:item.phone_number,
url:item.url,
verified:item.verified,
active:!item.pending,
};
};

// Filtering
const filterData = () => {
  let list = rawData.value.slice();

  // search(es)
  {
    const q = String(searchTerm.value || '').toLowerCase().trim();
    if (q) {
      const fields: string[] = [];
      if (fields.length) {
        list = list.filter((row:any) =>
          fields.some((f:string) => String(getByPath(row, f) ?? '').toLowerCase().includes(q))
        );
      } else {
        list = list.filter((row:any) => JSON.stringify(row).toLowerCase().includes(q));
      }
    }
  }
  // no extra searches

  // dropdowns
  {
    const opts = [{"label":"همه","value":"all"},{"label":"احراز هویت شده","value":"true"},{"label":"احراز هویت نشده","value":"false"}];
    const found = opts.find(o => o.label === f_gfmlrj1.value);
    const val = found ? found.value : f_gfmlrj1.value;
    if ("verified" && !(val===undefined || val===null || val==='' || val==='all' || val==='همه')) {
      list = list.filter((row:any) => String(getByPath(row, "verified")) === String(val));
    }
  }
{
    const opts = [{"label":"همه","value":"all"},{"label":"فعال","value":"true"},{"label":"معلق","value":"false"}];
    const found = opts.find(o => o.label === f_dfl1enz.value);
    const val = found ? found.value : f_dfl1enz.value;
    if ("pending" && !(val===undefined || val===null || val==='' || val==='all' || val==='همه')) {
      list = list.filter((row:any) => String(getByPath(row, "active")) === String(val));
    }
  }

  filteredData.value = list.map(transformData);
};

// Fetch
const API_CONFIG = {
  "baseUrl": "https://api.vendow.ir",
  "path": "admins/store",
  "pathToList": "data",
  "method": "GET",
  "headers": {}
};
const fetchData = async () => {
  isLoading.value = true;
  try {
    if (!API_CONFIG) { rawData.value = []; filterData(); return; }
    const res = await request(API_CONFIG.path, {
      baseUrl: API_CONFIG.baseUrl,
      method: API_CONFIG.method,
      headers: { 'Cache-Control': 'no-cache', ...API_CONFIG.headers },
      body: API_CONFIG.method !== 'GET' ? API_CONFIG.body : undefined
    });
    if (!res?.status) {
      $notifyDanger(res?.message || 'خطا در دریافت اطلاعات');
      rawData.value = [];
    } else {
      const list = getByPath(res, API_CONFIG.pathToList) ?? res?.body ?? [];
      rawData.value = Array.isArray(list) ? list : [];
    }
    filterData();
  } catch (e) {
    $notifyDanger('مشکلی پیش آمد.');
    rawData.value = [];
    filterData();
  } finally {
    isLoading.value = false;
  }
};

// Watch filters
watch([
  searchTerm, f_gfmlrj1, f_dfl1enz
], filterData, { deep: true });

onBeforeMount(fetchData);
</script>
