<script setup>
import { useRuntimeConfig } from "nuxt/app";
import LoginV1 from "../components/login/LoginV1.vue";
import LoginV2 from "../components/login/LoginV2.vue";
let config = useRuntimeConfig().public.vornaPanel;
</script>
<template>
  <LoginV1 v-if="config.authType == 'version1'" />
  <LoginV2 v-else-if="config.authType == 'version2'" />
  <component v-else :is="config.authType" />
</template>
