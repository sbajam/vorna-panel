<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box>
        <Header class="text-2xl font-semibold mb-4">لاگ‌های خطا</Header>

        <!-- فرم جستجو و رفرش (مانند قبل) -->
        <div class="mb-4 flex items-center space-x-2">
          <input
            v-model="search"
            @keyup.enter="fetchErrorLogs"
            type="text"
            placeholder="جستجو بر اساس کاربر، نوع یا مسیر"
            class="border rounded px-3 py-1 outline-none w-64 shadow focus:ring focus:ring-blue-300"
          />
          <button
            @click="fetchErrorLogs"
            class="bg-blue-600 text-white px-4 py-1 rounded shadow hover:bg-blue-700 focus:ring focus:ring-blue-300"
          >
            جستجو
          </button>
          <button
            @click="fetchErrorLogs"
            class="bg-gray-600 text-white px-4 py-1 rounded shadow hover:bg-gray-700 focus:ring focus:ring-gray-300"
          >
            تازه‌سازی
          </button>
        </div>

        <!-- اگر صفحه کوچک است -->
        <div v-if="isSmallScreen" class="text-center text-red-500 py-10">
          این صفحه در دستگاه شما قابل مشاهده نیست.
        </div>

        <!-- جدول لاگ‌های خطا -->
        <div v-else-if="logs.length" class="overflow-x-auto">
          <table class="min-w-full bg-white shadow rounded">
            <thead>
              <tr class="bg-gray-100">
                <th class="px-4 py-2 text-center">#</th>
                <th class="px-4 py-2 text-center">کاربر</th>
                <th class="px-4 py-2 text-center">نوع خطا</th>
                <th class="px-4 py-2 text-center">URL</th>
                <th class="px-4 py-2 text-center">زمان</th>
                <th class="px-4 py-2 text-center">اسکرین‌شات</th>
                <th class="px-4 py-2 text-center">جزئیات</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in paginatedLogs"
                :key="item.id"
                class="border-t hover:bg-gray-50"
              >
                <td class="px-4 py-2 text-center">
                  {{ (page - 1) * perPage + index + 1 }}
                </td>
                <td class="px-4 py-2 text-center">{{ item.username }}</td>
                <td class="px-4 py-2 text-center">{{ item.type }}</td>
                <td class="px-4 py-2 text-center">{{ item.url }}</td>
                <td class="px-4 py-2 text-center">{{ formatDate(item.timestamp) }}</td>
                <!-- ستون اسکرین‌شات: اگر وجود داشت، Thumbnail نشان بده -->
                <td class="px-4 py-2 text-center">
                  <img
                    v-if="item.screenshot"
                    :src="item.screenshot"
                    class="h-16 w-auto object-contain cursor-pointer rounded border"
                    @click="viewScreenshot(item.screenshot)"
                    alt="Screenshot"
                  />
                  <span v-else class="text-gray-400">–</span>
                </td>
                <td class="px-4 py-2 text-center">
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

        <!-- Pagination (مانند قبل) -->
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
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { format } from "date-fns";
import { faIR } from "date-fns/locale";
import { useFetch } from "#app";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

interface ErrorLog {
  id: number;
  username: string;
  type: string;
  url: string;
  timestamp: string;
  screenshot?: string; // Base64
  details?: any;
}

interface ErrorLogsResponse {
  data: ErrorLog[];
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
const meta = ref<ErrorLogsResponse["meta"]>({
  total: 0,
  page: 1,
  perPage: 20,
  totalPages: 1,
});
const logs = ref<ErrorLog[]>([]);

// فیلتر ساده (جستجو در username، type یا url)
const filteredLogs = computed(() => {
  if (!search.value) return logs.value;
  const term = search.value.toLowerCase();
  return logs.value.filter(
    (log) =>
      log.username.toLowerCase().includes(term) ||
      log.type.toLowerCase().includes(term) ||
      log.url.toLowerCase().includes(term)
  );
});

const paginatedLogs = computed(() => {
  const start = (page.value - 1) * perPage.value;
  const end = start + perPage.value;
  return filteredLogs.value.slice(start, end);
});

const totalPages = computed(() =>
  Math.ceil(filteredLogs.value.length / perPage.value)
);

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return format(date, "yyyy/MM/dd HH:mm:ss", { locale: faIR });
}

// بررسی اندازهٔ صفحه برای نمایش در دستگاه‌های کوچکتر
function checkScreenSize() {
  isSmallScreen.value = window.innerWidth < 1024; // فرضاً <lg
}

// فراخوانی لاگ‌ها
async function fetchErrorLogs() {
  const query = new URLSearchParams({
    page: String(page.value),
    perPage: String(perPage.value),
    ...(search.value ? { search: search.value } : {}),
  }).toString();

  const { data, error } = await useFetch<ErrorLogsResponse>(
    `/api/error-logs?${query}`,
    { method: "GET" }
  );
  if (error.value) {
    console.error("خطا در دریافت لاگ‌های خطا:", error.value);
    return;
  }
  if (data.value) {
    logs.value = data.value.data;
    meta.value = data.value.meta;
    page.value = data.value.meta.page;
    perPage.value = data.value.meta.perPage;
  }
}

function changePage(newPage: number) {
  if (newPage < 1 || newPage > totalPages.value) return;
  page.value = newPage;
}

function updatePagination() {
  page.value = 1;
}

// نمایش اسکرین‌شات در مودال SweetAlert
function viewScreenshot(base64: string) {
  Swal.fire({
    title: "اسکرین‌شات خطا",
    imageUrl: base64,
    imageAlt: "Screenshot",
    imageWidth: 600,
  });
}

// نمایش جزئیات (شامل JSON) در مودال
function showDetails(item: ErrorLog) {
  const detailJson = JSON.stringify(item.details || {}, null, 2);
  const content = `
    <p><strong>کاربر:</strong> ${item.username}</p>
    <p><strong>نوع خطا:</strong> ${item.type}</p>
    <p><strong>URL:</strong> ${item.url}</p>
    <p><strong>زمان:</strong> ${formatDate(item.timestamp)}</p>
    <p><strong>جزئیات کامل:</strong></p>
    <pre style="white-space: pre-wrap; max-height: 300px; overflow: auto; background: #f5f5f5; padding: 8px; border-radius: 4px; font-size: 13px;">
${detailJson}
    </pre>
  `;
  Swal.fire({
    title: "جزئیات کامل خطا",
    html: content,
    width: "650px",
    scrollbarPadding: false,
    customClass: { popup: "text-right" },
  });
}

onMounted(() => {
  window.addEventListener("resize", checkScreenSize);
  checkScreenSize();
  fetchErrorLogs();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreenSize);
});
</script>

<style scoped>
pre {
  max-height: 300px;
  overflow: auto;
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-size: 13px;
}
</style>
