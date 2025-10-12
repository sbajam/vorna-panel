<template>
  <div class="flex flex-col items-center justify-center min-h-screen text-center px-4">
    <h1 class="text-6xl font-bold text-red-600 mb-4">403</h1>
    <p class="text-xl text-gray-700 mb-8">شما اجازه دسترسی به این صفحه را ندارید.</p>

    <div class="flex gap-4">
      <button
        @click="goBack"
        class="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition"
      >
        بازگشت به صفحه قبل
      </button>

      <NuxtLink
        to="/login"
        class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
      >
        ورود به حساب کاربری
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from "nuxt/app";

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    navigateTo('/login') // یا مسیر دلخواه پیش‌فرض
  }
}
</script>
