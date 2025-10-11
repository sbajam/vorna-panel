<script setup>
import { useRuntimeConfig } from "nuxt/app";
let config = useRuntimeConfig().public.vornaPanel;
</script>
<template>
  <LoginV1 v-if="config.authType =='version1'" />
  <LoginV2 v-else-if="config.authType == 'version2'" />
  <LoginCustom v-else />
</template>