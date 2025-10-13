<!-- components/PageTitle.vue -->
<script setup>
import { useBreadcrumbStore } from "#vorna-stores/breadcrumb";
import Breadcrumb from "./Breadcrumb.vue";
import {
  useRoute,
  useRouter,
  useRuntimeConfig,
  useHead,
  navigateTo,
} from "nuxt/app";
import {
  computed,
  ref,
  useSlots,
  onBeforeMount,
  watch,
  defineProps,
  nextTick,
  onMounted,
} from "vue";

const props = defineProps({ breadcrumb: { type: Boolean, default: true } });
const slots = useSlots();
const route = useRoute();
const bc = useBreadcrumbStore();

function extractText(nodes) {
  return nodes
    .map((node) => {
      if (typeof node.children === "string") return node.children;
      if (Array.isArray(node.children)) return extractText(node.children);
      return "";
    })
    .join("");
}
onMounted(() => {
  const slotNodes = slots.default ? slots.default() : [];
  const titleText = extractText(slotNodes).trim();
  if (titleText) {
    useHead({ title: titleText });
    bc.push(titleText, route.fullPath);
  }
});
</script>

<template>
  <div class="flex flex-col gap-2">
    <h1 class="header"><slot /></h1>
    <Breadcrumb v-if="props.breadcrumb" />
  </div>
</template>
