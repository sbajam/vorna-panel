<template>
  <div
    :class="['input-div', { 'flex-col !items-start label-top ': labelPosition === 'top' }]"
  >
    <label v-if="label" class="text-primary text-lg font-semibold">{{
      label
    }}</label>
    <div class="flex flex-col gap-2 w-full">
      <Editor
        :image="image"
        :placeholder="placeholder"
        :disabled="disabled"
        :name="name"
        v-model="content"
      />
      <p v-if="errorMessage" class="text-xs text-red-600">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  useCookie,
  useNuxtApp,
  useRoute,
  navigateTo,
  useRouter,
  useRuntimeConfig,
  computed,
  onBeforeMount,
  watch,
  nextTick,
  onMounted
} from "#imports";

const props = defineProps({
  modelValue: { type: String, default: "" },
  label: { type: String, default: "" },
  placeholder: { type: String, default: "" },
  name: { type: String, default: "" },
  errorMessage: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  image: { type: Boolean, default: true },
  labelPosition: {
    type: String,
    default: "right",
  },
});
const emit = defineEmits(["update:modelValue"]);

const content = ref(props.modelValue);
watch(
  () => props.modelValue,
  (v) => (content.value = v)
);
watch(content, (v) => emit("update:modelValue", v));
</script>
