<script setup>
import { useNuxtApp } from "#imports";
import Spinner from "../../src/runtime/components/Spinner.vue";

const nuxtApp = useNuxtApp();
const { pending, error, data, request } = useApi();

const columns = ref([
  { key: "id", label: "شماره", type: "text" },
  { key: "title", label: "عنوان", type: "text" },
  { key: "summary", label: "خلاصه", type: "html" },
  // { key: 'timeToRead', label: 'زمان مطالعه', type: 'text' },
  { key: "date", label: "تاریخ", type: "text" },
]);
let articles = ref([]);
async function getArticles() {
  await request("/articles");
  if (data.value.status) {
    articles.value = data.value.body.articles;
  } else {
    nuxtApp.$notifyDanger(data.value.message || "خطا در بارگذاری مقالات.");
  }
}

onBeforeMount(getArticles);
</script>

<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box>
        <Header>مقالات</Header>

        <Spinner v-if="pending" />
        <SmartTable
          v-else
          :columns="columns"
          :data="articles"
          :sortable="true"
          :rowClickable="true"
          edit="blog"
          delete="articles"
        />
      </Box>
    </template>
  </NuxtLayout>
</template>
