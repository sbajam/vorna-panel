<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useRoute } from "#app";

const { request } = useApi();
const router = useRouter();
const route = useRoute();

const roles = ref([]);
const selectedRoleId = ref(null);
const selectedRoleName = ref("");
const allPermissions = ref([]);
const selectedPermissionKeys = ref(new Set());

let lastClickedIndex = ref(null);
let lastClickedModule = ref(null);

async function fetchRoles() {
  const res = await request("/api/roles", { method: "GET", baseUrl: " " });
  if (res.status) {
    roles.value = res.data;
  }
}

async function fetchPermissions() {
  const res = await request("/api/permissions", { method: "GET", baseUrl: " " });
  if (res.status) {
    allPermissions.value = res.data;
  }
}

function onRoleChange() {
  const selected = roles.value.find((r) => r.id === selectedRoleId.value);
  if (selected) {
    selectedRoleName.value = selected.name;
    selectedPermissionKeys.value = new Set(selected.permissions.map((p) => p.key));
  }
}

function createNewRole() {
  selectedRoleId.value = null;
  selectedRoleName.value = "";
  selectedPermissionKeys.value = new Set();
}
function selectRole(role) {
  selectedRoleId.value = role.id
  selectedRoleName.value = role.name
  selectedPermissionKeys.value = new Set(role.permissions.map(p => p.key))
}

async function saveRole() {
  const payload = {
    name: selectedRoleName.value,
    permissions: Array.from(selectedPermissionKeys.value),
  };

  let res;
  if (selectedRoleId.value) {
    res = await request(`/api/roles/${selectedRoleId.value}`, {
      method: "PUT",
      baseUrl: " ",
      data: payload,
    });
  } else {
    res = await request("/api/roles", {
      method: "POST",
      baseUrl: " ",
      data: payload,
    });
  }

  if (res.status) {
    await fetchRoles();
    selectedRoleId.value = res.data.id;
    onRoleChange();
  }
}

async function deleteRole() {
  if (!selectedRoleId.value) return;
  const confirmed = confirm("آیا مطمئنی که می‌خواهی نقش را حذف کنی؟");
  if (!confirmed) return;

  const res = await request(`/api/roles/${selectedRoleId.value}`, {
    method: "DELETE",
    baseUrl: " ",
  });

  if (res.status) {
    selectedRoleId.value = null;
    selectedRoleName.value = "";
    selectedPermissionKeys.value = new Set();
    await fetchRoles();
  }
}

function togglePermission(key, module, index, event) {
  const allInModule = groupedPermissions.value[module];
  const clickedIndex = index;

  if (event.shiftKey && lastClickedModule.value === module && lastClickedIndex.value !== null) {
    const start = Math.min(lastClickedIndex.value, clickedIndex);
    const end = Math.max(lastClickedIndex.value, clickedIndex);
    for (let i = start; i <= end; i++) {
      selectedPermissionKeys.value.add(allInModule[i].key);
    }
  } else if (event.ctrlKey || event.metaKey) {
    selectedPermissionKeys.value.has(key)
      ? selectedPermissionKeys.value.delete(key)
      : selectedPermissionKeys.value.add(key);
  } else {
    selectedPermissionKeys.value.has(key)
      ? selectedPermissionKeys.value.delete(key)
      : selectedPermissionKeys.value.add(key);
  }

  lastClickedIndex.value = clickedIndex;
  lastClickedModule.value = module;
}

function selectAllViewPermissions() {
  allPermissions.value
    .filter((p) => p.action === "view")
    .forEach((p) => selectedPermissionKeys.value.add(p.key));
}

function selectAllPermissions() {
  allPermissions.value.forEach((p) => selectedPermissionKeys.value.add(p.key));
}

function clearAllPermissions() {
  selectedPermissionKeys.value.clear();
}

const groupedPermissions = computed(() => {
  return allPermissions.value.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {});
});

onMounted(() => {
  fetchRoles();
  fetchPermissions();
});
</script>
<template>
  <NuxtLayout name="admin">
    <template #main>
      <div class="w-full flex flex-col gap-6">

        <!-- بالا: فرم ویرایش نقش -->
        <div class="flex flex-wrap justify-between gap-6">

          <!-- سمت چپ: input نام نقش -->
          <div class="flex-1">
            <InputField
              v-model="selectedRoleName"
              label="نام نقش"
              type="text"
              placeholder="مثلاً admin"
            />
          </div>

          <!-- سمت راست: عملیات نقش -->
          <div class="flex gap-3 items-end">
            <Button color="primary-100" @click="createNewRole">
              <Icon name="fa6-solid:plus" class="ml-1" />
              نقش جدید
            </Button>

            <Button
              color="secondary-100"
              variant="outline"
              :disabled="!selectedRoleId"
              @click="deleteRole"
            >
              <Icon name="fa6-solid:trash" class="ml-1" />
              حذف
            </Button>

            <Button
              color="primary-100"
              variant="solid"
              @click="saveRole"
              :disabled="!selectedRoleName"
            >
              <Icon name="fa6-solid:floppy-disk" class="ml-1" />
              ذخیره
            </Button>
          </div>
        </div>

        <!-- لیست نقش‌ها (دکمه‌ای، بدون select) -->
        <div class="bg-white p-4 rounded shadow">
          <h3 class="text-base font-semibold mb-2">لیست نقش‌ها</h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="role in roles"
              :key="role.id"
              @click="selectRole(role)"
              class="border px-3 py-2 rounded text-sm "
              :class="{
                'bg-primary-100 text-white': selectedRoleId === role.id
              }"
            >
              {{ role.name }} ({{ role.permissions.length }})
            </button>
          </div>
        </div>

        <!-- لیست دسترسی‌ها -->
        <div class="bg-white p-6 rounded shadow">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold">دسترسی‌ها</h3>
            <NuxtLink to="/permissions" class="text-blue-600 text-sm underline">
              مدیریت دسترسی‌ها
            </NuxtLink>
          </div>

          <!-- دکمه‌های کنترل سریع -->
          <div class="flex flex-wrap gap-2 mb-6 text-sm">
            <Button size="sm" color="primary-100" @click="selectAllViewPermissions">
              <Icon name="fa6-solid:eye" class="ml-1" />
              همه view
            </Button>
            <Button size="sm" color="primary-100" @click="selectAllPermissions">
              <Icon name="fa6-solid:plus" class="ml-1" />
              همه
            </Button>
            <Button size="sm" color="secondary-100" variant="outline" @click="clearAllPermissions">
              <Icon name="fa6-solid:eraser" class="ml-1" />
              پاک‌سازی
            </Button>
          </div>

          <!-- پرمیشن‌ها به صورت ۲ ستونه -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="(group, module) in groupedPermissions"
              :key="module"
              class="mb-4"
            >
              <h4 class="text-sm font-semibold mb-2 text-gray-700">{{ module }}</h4>
              <div class="flex flex-col gap-1">
                <button
                  v-for="(perm, index) in group"
                  :key="perm.key"
                  class="text-right px-2 py-1 rounded cursor-pointer flex items-center justify-between text-sm"
                  :class="{
                    'bg-secondary-100 text-white': selectedPermissionKeys.has(perm.key),
                  }"
                  @click="togglePermission(perm.key, module, index, $event)"
                >
                  {{ perm.action }}
                  <Icon name="fa6-solid:lock" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </NuxtLayout>
</template>

