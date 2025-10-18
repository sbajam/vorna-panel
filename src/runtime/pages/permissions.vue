<script setup>
import { ref, computed, onMounted } from "vue";
// import { useApi } from '~/composables/useApi';
import { useNuxtApp } from '#imports';
import Box from '../components/ui/Box.vue';
import Header from '../components/ui/Header.vue';
import CustomeButton from '../components/CustomeButton.vue';

const { request } = useApi();
const { $notify } = useNuxtApp();

const loading = ref(true);
const permissions = ref([]);
const actions = ["view", "create", "edit", "delete"];
const permissionMap = ref({});

async function fetchPermissions() {
  loading.value = true;
  const res = await request("/api/permissions", {
    method: "get",
    baseUrl: " ",
  });
  if (res.status) {
    permissions.value = res.data;
    permissionMap.value = Object.fromEntries(
      res.data.map((p) => [`${p.module}.${p.action}`, p])
    );
  }
  loading.value = false;
}

function togglePermission(module, action) {
  const key = `${module}.${action}`;
  if (permissionMap.value[key]) {
    delete permissionMap.value[key];
  } else {
    permissionMap.value[key] = { key, module, action };
  }
}

async function savePermissions() {
  const all = Object.values(permissionMap.value);
  const res = await request("/api/permissions", {
    method: "post",
    data: all,
    baseUrl: " ",
  });
  $notify(
    res.status ? "ذخیره شد" : "خطا در ذخیره",
    res.status ? "success" : "danger"
  );
}

function addMissingViewPermissions() {
  const existingViewKeys = Object.keys(permissionMap.value).filter((k) =>
    k.endsWith(".view")
  );
  const modules = [...new Set(permissions.value.map((p) => p.module))];

  for (const module of modules) {
    const key = `${module}.view`;
    if (!permissionMap.value[key]) {
      permissionMap.value[key] = {
        key,
        module,
        action: "view",
      };
    }
  }
}

const sortedModules = computed(() =>
  [...new Set(permissions.value.map((p) => p.module))].sort()
);

onMounted(fetchPermissions);
</script>

<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box>
        <Header class="text-xl font-bold mb-6">مدیریت دسترسی‌ها</Header>

        <div v-if="loading" class="text-gray-600">در حال بارگذاری...</div>

        <div v-else class="overflow-auto rounded border">
          <table class="min-w-full table-auto text-sm">
            <thead class="bg-gray-100 text-gray-700">
              <tr>
                <th class="text-right p-3 font-semibold">ماژول</th>
                <th
                  v-for="action in actions"
                  :key="action"
                  class="text-center p-3 font-semibold capitalize"
                >
                  {{ action }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="module in sortedModules"
                :key="module"
                class="border-t hover:bg-gray-50"
              >
                <td class="text-right p-3 font-medium text-gray-800">
                  {{ module }}
                </td>
                <td
                  v-for="action in actions"
                  :key="action"
                  class="text-center p-3"
                >
                  <input
                    type="checkbox"
                    class="w-4 h-4 accent-primary-100"
                    :checked="!!permissionMap[`${module}.${action}`]"
                    @change="togglePermission(module, action)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- دکمه‌ها -->
        <div class="flex flex-wrap gap-3 mt-6">
          <CustomeButton
            color="secondary-100"
            variant="outline"
            @click="addMissingViewPermissions"
          >
            <Icon name="fa6-solid:eye" class="ml-1" />
            افزودن viewهای ناقص
          </CustomeButton>

          <CustomeButton color="primary-100" variant="solid" @click="savePermissions">
            <Icon name="fa6-solid:floppy-disk" class="ml-1" />
            ذخیره تغییرات
          </CustomeButton>
        </div>
      </Box>
    </template>
  </NuxtLayout>
</template>
