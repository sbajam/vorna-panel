<script setup lang="ts">
// import { useRequestStore } from "#vorna-stores/requestStore";

const { data, pending, request } = useApi();
const { $notify, $notifyDanger } = useNuxtApp();

const status = ref<"همه" | "خوانده نشده" | "خوانده شده">("خوانده نشده");
const allItems = ref<any[]>([]);
const activeId = ref<number | null>(null);

const filtered = computed(() => {
  if (status.value === "همه") return allItems.value;
  const isRead = status.value === "خوانده شده";
  return allItems.value.filter((i) => !!i.read === isRead);
});

const activeItem = computed(() =>
  activeId.value ? allItems.value.find((i) => i.id === activeId.value) : null
);

async function fetchData() {
  await request("consultations");
  if (data.value?.status) {
    allItems.value = data.value.body ?? [];
  } else {
    $notifyDanger(data.value?.message ?? "خطا در دریافت داده");
  }
}
onBeforeMount(fetchData);

async function updateRead(nextVal: boolean) {
  if (!activeItem.value) return;
  const prev = activeItem.value.read;
  activeItem.value.read = nextVal; // optimistic
  try {
    await request(`contactus/${activeItem.value.id}`, {
      method: "post",
      data: { read: nextVal },
    });
    $notify(
      data.value?.message ?? "ذخیره شد",
      data.value?.status ? "success" : "danger"
    );
    //  let count=dataArray.value.filter((e)=>!e.read).length
    //     useRequestStore().set(useRequestStore().shoppingCart,count)
  } catch {
    activeItem.value.read = prev;
    $notifyDanger("خطا در بروزرسانی");
  }
}
</script>

<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box
        class="flex flex-col md:flex-row gap-4 md:gap-0 md:items-center justify-around mb-4"
      >
        <Header>فرم ارتباط با ما</Header>
        <div class="flex items-center justify-center gap-8 lg:w-2/5">
          <h3
            class="lg:text-lg font-semibold text-secondary-100 whitespace-nowrap"
          >
            وضعیت :
          </h3>
          <DropDown
            :items="['همه', 'خوانده نشده', 'خوانده شده']"
            v-model="status"
          />
        </div>
      </Box>

      <Spinner v-if="pending" />

      <QuestionDetails
        v-else
        :items="filtered"
        item-key="id"
        v-model="activeId"
      >
        <template #list-item="{ item }">
          <Icon
            class="text-2xl text-secondary-100 group-hover:text-primary-100"
            :name="`fa6-solid:envelope${item.read ? '-open' : ''}`"
          />
          <div class="w-full">
            <div class="flex items-center gap-2 mb-2">
              <!-- TODO:چیا رو باید بزاریم اینجا: -->
              <h2 class="font-semibold text-lg"></h2>
              <h2 class="font-semibold text-lg">{{ item.date }}</h2>
            </div>
            <p class="text-sm">
              {{ (item.question ?? "").slice(0, 180) }}
              <font-awesome-icon
                class="mr-2"
                :icon="['fas', 'arrow-left-long']"
              />
            </p>
          </div>
        </template>
        <!-- TODO: چطوری اینا باید چیده شن -->
        <template #detail-header="{ item }">
          <div class="flex gap-2 items-center">
            <h2 class="font-semibold text-xl">{{ item.fullname }}</h2>
            <h2 class="font-semibold text-xl">{{ item.phone }}</h2>
          </div>
        </template>

        <template #detail-body="{ item }">
          {{ item.question }}
        </template>

        <template #detail-actions="{ item }">
          <div class="flex justify-end px-8">
            <DropDown
              :items="[
                { label: 'خوانده شده', value: true },
                { label: 'خوانده نشده', value: false },
              ]"
              display-field="label"
              value-field="value"
              :model-value="item.read"
              @update:modelValue="(v) => updateRead(!!v)"
            />
          </div>
        </template>
      </QuestionDetails>
    </template>
  </NuxtLayout>
</template>
