<template>
  <div class="flex flex-col gap-3" :title="tooltip">
    <label v-if="label" class="text-primary text-lg font-semibold">{{ label }}</label>

    <div class="flex gap-2">
      <input
        class="w-full border rounded-lg px-3 py-2"
        :placeholder="placeholder"
        :name="name"
        :disabled="disabled"
        v-model="inputVal"
        @keydown="onKeydown"
      />
      <button
        type="button"
        class="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm"
        :disabled="disabled"
        @click="add"
      >
        افزودن
      </button>
    </div>

    <div class="flex flex-wrap gap-2">
      <span
        v-for="(t, i) in norm(modelValue)"
        :key="i"
        class="px-2 py-1 rounded-lg bg-secondary-100 text-white text-xs flex items-center gap-2"
      >
        {{ t }}
        <button type="button" class="text-white/90" @click="removeAt(i)">×</button>
      </span>
    </div>

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
  onMounted
} from "#imports";

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  label: { type: String, default: "" },
  placeholder: { type: String, default: "" },
  name: { type: String, default: "tags" },
  errorMessage: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  maxItems: { type: Number, default: 50 },
  minItems: { type: Number, default: 0 },
  tooltip: { type: String, default: "" },
});
const emit = defineEmits(["update:modelValue"]);

const inputVal = ref("");

const norm = (arr = []) =>
  (arr || [])
    .map((t) => (typeof t === "string" ? t : t?.value || ""))
    .filter(Boolean);

function add() {
  if (props.disabled) return;
  const v = (inputVal.value || "").trim();
  if (!v) return;
  const current = norm(props.modelValue);
  if (current.includes(v)) return;
  if (current.length >= props.maxItems) return;
  emit("update:modelValue", [...props.modelValue, v]);
  inputVal.value = "";
}
function removeAt(i) {
  if (props.disabled) return;
  const arr = [...props.modelValue];
  arr.splice(i, 1);
  emit("update:modelValue", arr);
}
function onKeydown(e) {
  if (e.ctrlKey && e.key === "Enter") add();
}
</script>
