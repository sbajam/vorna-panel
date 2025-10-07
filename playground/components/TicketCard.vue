<template>
  <div class="block px-4 py-6 rounded-xl bg-white border border-gray-200">
    <div class="flex flex-col gap-2 text-lg">
      <div class="text-gray-300 font-bold">موضوع:</div>
      <div class="text-gray-600">{{ prop.data.title }}</div>
    </div>
    <div class="flex flex-col gap-2 text-lg mt-4">
      <div class="text-gray-300 font-bold">متن پیام:</div>
      <div class="text-gray-600" v-html="prop.data.text"></div>
    </div>
    <div class="flex gap-2 text-lg items-center mt-6">
      <div class="text-gray-300 font-bold">وضعیت:</div>
      <div
        v-if="prop.data.read"
        class="bg-primary-100  text-white font-bold text-base rounded-xl py-2 px-4"
      >
        پاسخ داده شده
      </div>
      <div
        v-else
        class="bg-primary-100  text-white font-bold text-base rounded-xl py-2 px-4"
      >
        در حال بررسی
      </div>
    </div>
    <div class="bg-gray-100 h-0.5 w-full rounded-full my-6"></div>
    <NuxtLink
      :to="`support/${prop.data.id}`"
      class="flex items-center font-bold gap-2 text-lg text-gray-400"
      >نمایش پاسخ <font-awesome-icon :icon="['fas', 'chevron-left']"
    /></NuxtLink>
  </div>
</template>
<script setup>
let prop = defineProps({ data: Object });
</script>
