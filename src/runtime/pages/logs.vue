<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box>
        <Header class="text-2xl font-semibold mb-4">لاگ‌های سیستم</Header>

        <!-- فرم جستجو -->
        <div class="mb-4 flex items-center space-x-2">
          <input
            v-model="search"
            @keyup.enter="filterLogs"
            type="text"
            placeholder="جستجو بر اساس کاربر یا مسیر"
            class="border rounded px-3 py-1 outline-none w-64 shadow focus:ring focus:ring-blue-300"
          />
          <button
            @click="filterLogs"
            class="bg-blue-600 text-white px-4 py-1 rounded shadow hover:bg-blue-700 focus:ring focus:ring-blue-300"
          >
            جستجو
          </button>
          <button
            @click="fetchLogs"
            class="bg-gray-600 text-white px-4 py-1 rounded shadow hover:bg-gray-700 focus:ring focus:ring-gray-300"
          >
            تازه‌سازی
          </button>
        </div>

        <!-- نمایش پیام برای دستگاه‌های کوچک‌تر از lg -->
        <div v-if="isSmallScreen" class="text-center text-red-500 py-10">
          این صفحه فقط در لپتاب قابل مشاهده است و نه در دستگاه شما.
        </div>

        <!-- جدول لاگ‌ها -->
        <div v-else-if="filteredLogs.length" class="overflow-x-auto">
          <table class="min-w-full bg-white shadow rounded">
            <thead>
              <tr class="bg-gray-100">
                <th class="px-4 py-2 text-center cursor-pointer" @click="sortBy('id')">#</th>
                <th class="px-4 py-2 text-center cursor-pointer" @click="sortBy('username')">کاربر</th>
                <th class="px-4 py-2 text-center cursor-pointer" @click="sortBy('type')">نوع</th>
                <th class="px-4 py-2 text-center cursor-pointer" @click="sortBy('url')">مسیر (URL)</th>
                <th class="px-4 py-2 text-center cursor-pointer" @click="sortBy('status')">وضعیت</th>
                <th class="px-4 py-2 text-center cursor-pointer" @click="sortBy('ip')">IP</th>
                <th class="px-4 py-2 text-center cursor-pointer" @click="sortBy('timestamp')">زمان</th>
                <th class="px-4 py-2 text-center cursor-pointer" @click="sortBy('browser')">مرورگر</th>
                <th class="px-4 py-2 text-center cursor-pointer" @click="sortBy('device')">دستگاه</th>
                <th class="px-4 py-2 text-center cursor-pointer" @click="sortBy('os')">سیستم‌عامل</th>
                <th class="px-4 py-2 text-center cursor-pointer" @click="sortBy('method')">متد</th>
                <th class="px-4 py-2 text-center">جزئیات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in paginatedLogs" :key="item.id" class="border-t">
                <td class="px-4 py-2 cursor-pointer !text-xs" @click="filterBy('id', item.id)">
                  {{ (page - 1) * perPage + index + 1 }}
                </td>
                <td class="px-4 py-2 cursor-pointer !text-xs" @click="filterBy('username', item.username)">{{ item.username }}</td>
                <td class="px-4 py-2 cursor-pointer !text-xs" @click="filterBy('type', item.type)">{{ item.type }}</td>
                <td class="px-4 py-2 cursor-pointer !text-xs" @click="filterBy('url', item.url)">{{ item.url }}</td>
                <td class="px-4 py-2 cursor-pointer !text-xs" @click="filterBy('status', item.status)">{{ item.status ?? "-" }}</td>
                <td class="px-4 py-2 cursor-pointer !text-xs" @click="filterBy('ip', item.ip)">{{ item.ip }}</td>
                <td class="px-4 py-2 cursor-pointer !text-xs" @click="filterBy('timestamp', item.timestamp)">{{ formatDate(item.timestamp) }}</td>
                <td class="px-4 py-2 cursor-pointer !text-xs" @click="filterBy('browser', item.browser)">{{ item.browser }}</td>
                <td class="px-4 py-2 cursor-pointer !text-xs" @click="filterBy('device', item.device)">{{ item.device }}</td>
                <td class="px-4 py-2 cursor-pointer !text-xs" @click="filterBy('os', item.os)">{{ item.os }}</td>
                <td class="px-4 py-2 cursor-pointer !text-xs" @click="filterBy('method', item.method)">{{ item.method }}</td>
                <td class="px-4 py-2">
                  <button
                    @click="showDetails(item)"
                    class="text-blue-600 hover:text-blue-800"
                    title="مشاهده جزئیات"
                  >
                    🔍
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center text-gray-500 py-10">
          هیچ رکوردی یافت نشد.
        </div>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1 && !isSmallScreen"
          class="mt-4 flex items-center justify-between space-x-2"
        >
          <div class="flex items-center space-x-2">
            <button
              @click="changePage(page - 1)"
              :disabled="page <= 1"
              class="px-3 py-1 border rounded disabled:opacity-50"
            >
              قبلی
            </button>
            <span>صفحه {{ page }} از {{ totalPages }}</span>
            <button
              @click="changePage(page + 1)"
              :disabled="page >= totalPages"
              class="px-3 py-1 border rounded disabled:opacity-50"
            >
              بعدی
            </button>
          </div>
          <div>
            <label for="perPage" class="mr-2">تعداد رکورد در هر صفحه:</label>
            <select
              id="perPage"
              v-model="perPage"
              @change="updatePagination"
              class="border rounded px-2 py-1"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </Box>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { format } from "date-fns";
import { faIR } from "date-fns/locale";
import { useFetch } from "#app";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

interface UserLog {
  id: number;
  username: string;
  type: string;
  url: string;
  method?: string;
  status?: number;
  params?: any;
  user_agent: string;
  ip: string;
  timestamp: string;
  device?: string;
  os?: string;
  browser?: string;
  location?: any;
}

interface LogsResponse {
  data: UserLog[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

const page = ref(1);
const perPage = ref(20);
const search = ref("");
const isSmallScreen = ref(false);
const sortKey = ref<string | null>(null);
const sortOrder = ref<'asc' | 'desc'>('asc');
const meta = ref<LogsResponse["meta"]>({
  total: 0,
  page: 1,
  perPage: 20,
  totalPages: 1,
});

const logs = ref<UserLog[]>([]);
const filteredLogs = computed(() => {
  if (!search.value) return logs.value;
  const [key, value] = search.value.split(":");
  return logs.value.filter((log) => log[key]?.toString().includes(value));
});

const paginatedLogs = computed(() => {
  const start = (page.value - 1) * perPage.value;
  const end = start + perPage.value;
  return filteredLogs.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredLogs.value.length / perPage.value));

// تابعی برای فرمت تاریخ به شمسی یا میلادی
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return format(date, "yyyy/MM/dd HH:mm:ss", { locale: faIR });
}

// مرتب‌سازی بر اساس ستون
function sortBy(key: string) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  logs.value.sort((a, b) => {
    const aValue = a[key]?.toString() || "";
    const bValue = b[key]?.toString() || "";
    return sortOrder.value === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  });
}

// فیلتر کردن بر اساس مقدار
function filterBy(key: string, value: any) {
  search.value = `${key}:${value}`;
}

// فیلتر کردن بر اساس جستجو
function filterLogs() {
  page.value = 1;
}

// تغییر صفحه (Pagination)
function changePage(newPage: number) {
  if (newPage < 1 || newPage > totalPages.value) return;
  page.value = newPage;
}

// به‌روزرسانی تعداد رکوردها در هر صفحه
function updatePagination() {
  page.value = 1;
}

// بررسی سایز صفحه نمایش


// تابع فراخوانی API برای لاگ‌ها
async function fetchLogs() {
  const query = new URLSearchParams({
    page: String(page.value),
    perPage: String(perPage.value),
    ...(search.value ? { search: search.value } : {}),
    ...(sortKey.value ? { sortKey: sortKey.value, sortOrder: sortOrder.value } : {}),
  }).toString();

  const { data, error } = await useFetch<LogsResponse>(`/api/logs?${query}`, {
    method: "GET",
  });

  if (error.value) {
    console.error("خطا در دریافت لاگ‌ها:", error.value);
    return;
  }
  if (data.value) {
    logs.value = data.value.data;
    meta.value = data.value.meta;
    page.value = data.value.meta.page;
    perPage.value = data.value.meta.perPage;
  }
}

// تابعی برای باز کردن مودال جزئیات
function showDetails(item: UserLog) {
  const content = `
    <pre style="white-space: pre-wrap; text-align: left; font-size: 12px;">
      کاربر: ${item.username}\n
      نوع: ${item.type}\n
      URL: ${item.url}\n
      متد: ${item.method || '-'}\n
      وضعیت: ${item.status ?? '-'}\n
      پارامترها (Params):${JSON.stringify(item.params, null, 2)}\n
      پاسخ (Response):\n
      ${JSON.stringify(item.responseData, null, 2)}\n
      User-Agent: ${item.user_agent}\n
      IP: ${item.ip}\n
      دستگاه: ${item.device || '-'}\n
      سیستم‌عامل: ${item.os || '-'}\n
      مرورگر: ${item.browser || '-'}\n
      محل (Location):${JSON.stringify(item.location, null, 2)}\n
      زمان: ${formatDate(item.timestamp)}\n
    </pre>
  `;

  Swal.fire({
    title: 'جزئیات لاگ',
    html: content,
    width: '600px',
    scrollbarPadding: false,
    customClass: {
      popup: 'text-right',
    },
  });
}

// بار اول صفحه که لود می‌شود، لاگ‌ها را بگیریم
fetchLogs();
</script>

<style scoped>
/* برای نمایش JSON داخل <pre> بهتر است scroll داشته باشد */
pre {
  max-height: 200px;
  overflow: auto;
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-size: 13px;
}
</style>
