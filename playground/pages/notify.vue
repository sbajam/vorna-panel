<script setup>
import { useRuntimeConfig, useNuxtApp } from '#imports'

const config = useRuntimeConfig().public.vornaPanel
const nuxtApp = useNuxtApp()

// wrapper notifications
const { $notifyInfo, $notifySuccess, $notifyWarning, $notifyDanger,$showToast,$showSwal } = nuxtApp
// direct APIs
const { $toast, $swal } = nuxtApp
</script>

<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box class="p-6 space-y-8">

        <!-- Header -->
        <Header class="text-2xl font-bold">
          تست اعلان‌ها — حالت کلی: {{ config.notifications?.type || 'toast' }}
        </Header>

        <!-- بخش اول: با wrapper -->
        <Box class="space-y-4">
          <Header class="text-xl">از توابع wrapper notification</Header>
          <div class="flex flex-wrap gap-4">
            <button @click="$notifyInfo('پیام Info via wrapper')"
              class="px-4 py-2 bg-blue-500 text-white rounded">Info</button>
            <button @click="$notifySuccess('پیام Success via wrapper')"
              class="px-4 py-2 bg-green-500 text-white rounded">Success</button>
            <button @click="$notifyWarning('پیام Warning via wrapper')"
              class="px-4 py-2 bg-yellow-500 text-white rounded">Warning</button>
            <button @click="$notifyDanger('پیام Danger via wrapper')"
              class="px-4 py-2 bg-red-500 text-white rounded">Danger</button>
          </div>
        </Box>

        <!-- بخش دوم: با API مستقیم Toast -->
        <Box class="space-y-4">
          <Header class="text-xl">از API مستقیم $toast</Header>
          <div class="flex flex-wrap gap-4">
            <button @click="$showToast({ type: 'info',    message: 'پیام Info via $toast' })"
              class="px-4 py-2 bg-blue-500 text-white rounded">Toast Info</button>
            <button @click="$showToast({ type: 'success', message: 'پیام Success via $toast' })"
              class="px-4 py-2 bg-green-500 text-white rounded">Toast Success</button>
            <button @click="$showToast({ type: 'warning', message: 'پیام Warning via $toast' })"
              class="px-4 py-2 bg-yellow-500 text-white rounded">Toast Warning</button>
            <button @click="$showToast({ type: 'error',   message: 'پیام Error via $toast' })"
              class="px-4 py-2 bg-red-500 text-white rounded">Toast Error</button>
          </div>
        </Box>

        <!-- بخش سوم: با API مستقیم Swal -->
        <Box class="space-y-4">
          <Header class="text-xl">از API مستقیم $swal</Header>
          <div class="flex flex-wrap gap-4">
            <button @click="$showSwal({ icon: 'info',    text: 'پیام Info via $swal' })"
              class="px-4 py-2 bg-blue-500 text-white rounded">Swal Info</button>
            <button @click="$showSwal({ icon: 'success', text: 'پیام Success via $swal' })"
              class="px-4 py-2 bg-green-500 text-white rounded">Swal Success</button>
            <button @click="$showSwal({ icon: 'warning', text: 'پیام Warning via $swal' })"
              class="px-4 py-2 bg-yellow-500 text-white rounded">Swal Warning</button>
            <button @click="$showSwal({ icon: 'error',   text: 'پیام Error via $swal' })"
              class="px-4 py-2 bg-red-500 text-white rounded">Swal Error</button>
          </div>
        </Box>

      </Box>
    </template>
  </NuxtLayout>
</template>

<style scoped>
/* فقط RTL بودن header ها */
h1, h2, .text-2xl, .text-xl {
  direction: rtl;
}
</style>
