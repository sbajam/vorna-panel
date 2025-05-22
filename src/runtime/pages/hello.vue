<script setup>

const name = useRuntimeConfig().public.vornaPanel.name;
</script>

<template>
  <NuxtLayout name="admin">
    <template>
      <div class="flex items-center justify-center min-h-screen">
        <h1 class="text-4xl font-bold">سلام {{ name }}</h1>
      </div>
    </template>
  </NuxtLayout>
</template>
