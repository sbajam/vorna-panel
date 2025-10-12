<!-- components/widgets/WidgetHeader.vue -->
<template>
  <div class="flex justify-between items-center">
    <h3 class="text-sm font-semibold text-gray-800">
      {{ title }}
    </h3>
    <button class="text-gray-400 hover:text-gray-600">
      <!-- آیکون placeholder -->
      <Icon name="mdi:dots-vertical" />
    </button>
  </div>
</template>

<script setup>
import { computed,ref,onBeforeMount,watch,defineProps, } from 'vue';

let prop=defineProps({ title: String })
</script>
