<template>
  <div class="flex flex-col gap-2">
    <label v-if="label" class="text-primary text-lg font-semibold">{{
      label
    }}</label>
    <!-- ✅ برای ImageUploader -->
    <ImageUploader
      v-if="isImageUploader"
      :images="local"
      @update:images="update"
      :multiple="multiple"
      :max-files="maxFiles"
      :aspect-ratio="aspectRatio"
      :watermark="watermark"
      :watermarkImage="watermarkImage"
      :watermarkText="watermarkText"
      :showInfo="showInfo"
      :infoText="infoText"
      :sizeClass="sizeClass"
      :initial-images="initialImages"
    />

    <!-- FileUploader ساده -->
    <FileUploader
      v-else
      v-model="local"
      :accept="accept"
      :multiple="multiple"
      :maxFiles="maxFiles"
      :maxSize="maxSize"
      :disabled="disabled"
      @update:files="update"
      :initial-images="initialImages"
    />

    <p v-if="errorMessage" class="text-xs text-red-600">{{ errorMessage }}</p>
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
  onMounted, 
} from "#imports";

const props = defineProps({
  modelValue: { type: [File, Array, String, Object, null], default: null },
  label: { type: String, default: "" },
  name: { type: String, default: "" },
  errorMessage: { type: String, default: "" },
  disabled: { type: Boolean, default: false },

  isImageUploader: { type: Boolean, default: false },

  accept: { type: String, default: "" },
  multiple: { type: Boolean, default: false },
  maxFiles: { type: Number, default: 1 },
  maxSize: { type: Number, default: Infinity },
  initialImages: { type: [Array, String], default: () => [] },
  aspectRatio: { type: String, default: "1/1" },
  watermark: { type: Boolean, default: true },
  watermarkImage: { type: String, default: "" },
  watermarkText: { type: String, default: "" },
  showInfo: { type: Boolean, default: true },
  infoText: { type: String, default: "فرمت‌های مجاز: WebP, JPEG, PNG, GIF" },
  sizeClass: { type: String, default: "w-[200px]" },
});
const emit = defineEmits(["update:modelValue"]);

const local = ref(props.modelValue);
watch(
  () => props.modelValue,
  (v) => (local.value = v),
  { deep: true }
);
watch(
  () => local.value,
  (v) => {
     emit("update:modelValue", v); // داده به پدر فرستاده می‌شود
  },
  { deep: true }
);
watch(local, (v) => emit("update:modelValue", v), { deep: true });

function update(val) {
  console.log("Updated images in second component:", val);
  local.value = val; // state داخلی آپدیت می‌شود
//   fileRef.value = val; // اینجا مقدار fileRef را بروزرسانی کنید
}


</script>
