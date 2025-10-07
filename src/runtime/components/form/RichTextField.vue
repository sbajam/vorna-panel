<template>
  <div class="flex flex-col gap-2">
    <label v-if="label" class="text-primary text-lg font-semibold">{{ label }}</label>
    <Editor
      :image="image"
      :placeholder="placeholder"
      :disabled="disabled"
      :name="name"
      v-model="content"
    />
    <p v-if="errorMessage" class="text-xs text-red-600">{{ errorMessage }}</p>
  </div>
</template>

<script setup>

const props = defineProps({
  modelValue: { type: String, default: "" },
  label: { type: String, default: "" },
  placeholder: { type: String, default: "" },
  name: { type: String, default: "" },
  errorMessage: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  image: { type: Boolean, default: true },
});
const emit = defineEmits(["update:modelValue"]);

const content = ref(props.modelValue);
watch(() => props.modelValue, (v) => (content.value = v));
watch(content, (v) => emit("update:modelValue", v));
</script>
