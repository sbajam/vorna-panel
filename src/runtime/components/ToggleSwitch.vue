<!--
/**
 * @component ToggleSwitch
 * @description A customizable toggle switch component for boolean inputs with multiple size variants
 * 
 * @features
 * 1. Visual Styling:
 *    - Three size variants (sm, md, lg)
 *    - Customizable colors for on/off states
 *    - Smooth transition animations
 *    - Custom label support
 * 
 * 2. Layout Options:
 *    - Flexible label positioning (top/right)
 *    - Icon support with tooltip
 *    - Error state display
 * 
 * 3. Interaction States:
 *    - Disabled state with visual feedback
 *    - Focus and hover states
 *    - Keyboard navigation support
 *    - Accessible (WAI-ARIA compliant)
 * 
 * @example Basic Usage
 * ```vue
 * <ToggleSwitch
 *   v-model="isEnabled"
 *   label="Enable notifications"
 * />
 * ```
 * 
 * @example Custom Styling
 * ```vue
 * <ToggleSwitch
 *   v-model="isDarkMode"
 *   label="Dark Mode"
 *   size="lg"
 *   onColor="bg-purple-600"
 *   offColor="bg-gray-400"
 * />
 * ```
 * 
 * @example With Icon and Tooltip
 * ```vue
 * <ToggleSwitch
 *   v-model="isActive"
 *   label="Account Status"
 *   icon="user"
 *   tooltip="Toggle account activation status"
 *   :disabled="!hasPermission"
 * />
 * ```
 */
-->
<template>
  <!--
    ToggleSwitch Component
    - A styled switch for boolean on/off
    - Supports custom colors, labels, and sizes
    - Emits `update:modelValue` on toggle
  -->
  <div
    class="flex items-center gap-4"
    :class="{ 'flex-col !items-start': labelPosition === 'top' }"
  >
    <!-- Optional label -->
    <label
      v-if="label"
      class="text-primary-100 text-lg flex items-center gap-2 font-semibold  text-right whitespace-nowrap"
      ><Icon v-if="icon" :name="icon" /> {{ label }}
      <span
        v-if="tooltip"
        class="flex items-center justify-center px-1.5 aspect-square bg-secondary-100 text-white rounded-full cursor-pointer"
        :title="tooltip"
      >
        <Icon name="fa6-solid:question" />
      </span>
    </label>

    <div
      :class="[
        'flex items-center',
        disabled ? 'opacity-60 cursor-not-allowed' : '',
      ]"
    >      
      <button
        :class="[
          'relative inline-flex hover:shadow-none hover:translate-y-0  items-center transition-colors duration-200 focus:outline-none',
          sizeClasses.padding,
          modelValue ? sizeClasses.bgOn : sizeClasses.bgOff,
          disabled ? 'pointer-events-none' : '',
        ]"
        role="switch"
        :aria-checked="modelValue"
        :aria-disabled="disabled"
        @click="toggle"
        @keydown.space.prevent="toggle"
        :disabled="disabled"
      >
        <span
          :class="[
            'inline-block bg-white rounded-full shadow transform transition-transform duration-200',
            modelValue ? sizeClasses.dotOn : sizeClasses.dotOff,
          ]"
        ></span>
      </button>
    </div>
      <p
      v-if="errorMessage"
      class="text-red-600 text-sm absolute bottom-0 left-6"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
/**
 * ToggleSwitch Component
 *
 * Props:
 * @prop {boolean} modelValue - Bound boolean state (v-model)
 * @prop {'right'|'left'} labelPosition - Position of label relative to switch
 * @prop {'sm'|'md'|'lg'} size - Size variant of the switch
 * @prop {string} onColor - Tailwind bg class when on (e.g. 'bg-green-500')
 * @prop {string} offColor - Tailwind bg class when off (e.g. 'bg-gray-300')
 * @prop {boolean} disabled - Disable toggle interaction
 * @prop {Array<{ label: string; value: string|number }>} options - If non-empty, renders as a group of radios
 * @prop {'top'|'right'} labelPosition - Position of the label relative to the field
 * @prop {string} errorMessage - Error text to display
 * @prop {string} icon - Optional icon name from lucide icons
 * @prop {string} tooltip - Tooltip text for the icon
 *
 * Emits:
 * @event update:modelValue - new boolean value
 */
import { computed } from "vue";
import type { PropType } from "vue";

const props = defineProps({
  modelValue: { type: Boolean as PropType<boolean>, default: false },
  size: { type: String as PropType<"sm" | "md" | "lg">, default: "md" },
  onColor: { type: String, default: "bg-blue-500" },
  offColor: { type: String, default: "bg-gray-300" },
  disabled: { type: Boolean, default: false },
  label: { type: String, default: "" },
  labelPosition: {
    type: String as PropType<"top" | "right">,
    default: "right",
  },
  errorMessage: { type: String, default: "" },

  icon: { type: String, default: "" },
  tooltip: { type: String, default: "" },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

// Size-based classes for dimensions and positioning
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
    default: // md
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
  if (!props.disabled) {
    emit("update:modelValue", !props.modelValue);
  }
}
</script>
