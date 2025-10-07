<!-- ToggleSwitch.vue -->
<template>
  <div
    class="flex items-center gap-4"
    :class="{ 'flex-col !items-start': labelPosition === 'top' }"
  >
    <label
      v-if="label"
      class="text-primary-100 text-lg flex items-center gap-2 font-semibold text-right whitespace-nowrap"
    >
      <Icon v-if="icon" :name="icon" />
      {{ label }}
      <span
        v-if="tooltip"
        class="flex items-center justify-center px-1.5 aspect-square bg-secondary-100 text-white rounded-full cursor-pointer"
        :title="tooltip"
      >
        <Icon name="fa6-solid:question" />
      </span>
    </label>

    <div :class="['flex items-center', disabled ? 'opacity-60 cursor-not-allowed' : '']">
      <button
        :class="[
          'relative inline-flex items-center transition-colors duration-200 focus:outline-none hover:shadow-none hover:translate-y-0',
          sizeClasses.padding,
          modelValue ? sizeClasses.bgOn : sizeClasses.bgOff,
          disabled ? 'pointer-events-none' : '',
        ]"
        role="switch"
        :aria-checked="modelValue"
        :aria-disabled="disabled"
        :disabled="disabled"
        @click="toggle"
        @keydown.space.prevent="toggle"
      >
        <span
          :class="[
            'inline-block bg-white rounded-full shadow transform transition-transform duration-200',
            modelValue ? sizeClasses.dotOn : sizeClasses.dotOff,
          ]"
        />
      </button>
    </div>

    <p v-if="errorMessage" class="text-red-600 text-sm">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { PropType } from "vue";

const props = defineProps({
  modelValue: { type: Boolean as PropType<boolean>, default: false },
  size: { type: String as PropType<"sm" | "md" | "lg">, default: "md" },
  onColor: { type: String, default: "bg-secondary-100" },
  offColor: { type: String, default: "bg-gray-300" },
  disabled: { type: Boolean, default: false },
  label: { type: String, default: "" },
  labelPosition: { type: String as PropType<"top" | "right">, default: "right" },
  errorMessage: { type: String, default: "" },
  icon: { type: String, default: "" },
  tooltip: { type: String, default: "" },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const sizeClasses = computed(() => {
  switch (props.size) {
    case "sm":
      return {
        padding: "w-10 h-5 p-1 rounded-lg",
        dotOn: "-translate-x-5 w-3 h-3",
        dotOff: "translate-x-0 w-3 h-3",
        bgOn: props.onColor,
        bgOff: props.offColor,
      };
    case "lg":
      return {
        padding: "w-16 h-8 p-1.5 rounded-2xl",
        dotOn: "-translate-x-8 w-5 h-5",
        dotOff: "translate-x-0 w-5 h-5",
        bgOn: props.onColor,
        bgOff: props.offColor,
      };
    default:
      return {
        padding: "w-12 h-6 p-1 rounded-xl",
        dotOn: "-translate-x-6 w-4 h-4",
        dotOff: "translate-x-0 w-4 h-4",
        bgOn: props.onColor,
        bgOff: props.offColor,
      };
  }
});

function toggle() {
  if (props.disabled) return;
  // فقط emit؛ هیچ ست/واچ داخلی نداریم
  emit("update:modelValue", !props.modelValue);
}
</script>
