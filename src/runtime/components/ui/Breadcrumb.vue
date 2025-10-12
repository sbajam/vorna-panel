<!-- components/Breadcrumbs.vue -->
<script setup>
import { useBreadcrumbStore } from '#vorna-stores/breadcrumb'
import { computed,ref,onBeforeMount,watch,defineProps, } from 'vue';

const bc = useBreadcrumbStore()
const items = computed(() => bc.trail)
</script>

<template>
  <nav class="text-sm mb-4" v-show="items.length>1" aria-label="Breadcrumb">
    <ol class="list-reset flex">
      <li v-for="(item, idx) in items" :key="item.path" class="flex items-center">
        <NuxtLink
          :to="item.path"
          class="text-gray-500 hover:text-gray-700"
        >{{ item.title }}</NuxtLink>
        <span v-if="idx < items.length - 1" class="mx-2">/</span>
      </li>
    </ol>
  </nav>
</template>
