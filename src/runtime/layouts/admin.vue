<template>
  <div
    class="wrapper bg-[#EFEFF4] flex overflow-hidden h-screen rtl justify-between flex-nowrap"
  >
    <Sidebar
      :class="{
        'w-0': collapsed,
        'w-[80%] md:w-[15%] lg:w-3/12': !collapsed,
      }"
      @toggle="(val) => (collapsed = val)"
    />

    <main
      :class="[
        'transition-all duration-300 h-full overflow-x-hidden overflow-y-auto flex items-center flex-col  pt-8 md:pt-4 pb-4 w-full px-3 md:px-8 xl:px-12 md:py-12 ',
        collapsed ? 'w-full ' : 'w-full ',
      ]"
    >
    <div :class="{' bg-black bg-opacity-15 z-[1000] fixed inset-0 md:hidden':!collapsed}"></div>
      <slot name="main" />
    </main>
  </div>
</template>
<script setup>
import { ref } from 'vue';  // برای استفاده از ref
const collapsed = ref(true);
</script>
