<!--
/**
 * @component CheckBoxGroup
 * @description A flexible checkbox component supporting both single checkbox and group modes
 * 
 * @features
 * 1. Dual Mode Operation:
 *    - Single Checkbox: Standalone checkbox with label
 *    - Group Mode: Multiple selectable options
 * 
 * 2. Layout & Styling:
 *    - Custom styled checkboxes with check animation
 *    - Flexible label positioning (top/right)
 *    - Horizontal or vertical group layout
 *    - Consistent with design system
 * 
 * 3. Advanced Features:
 *    - Multiple selection in group mode
 *    - Icon support with tooltips
 *    - Error state handling with messages
 *    - Required field validation
 *    - Disabled state support
 *    - Accessible (WAI-ARIA compliant)
 * 
 * @example Single Checkbox Usage
 * ```vue
 * <CheckBoxGroup
 *   v-model="agreed"
 *   label="Accept terms and conditions"
 * />
 * ```
 * 
 * @example Group Mode Usage
 * ```vue
 * <CheckBoxGroup
 *   v-model="selectedFeatures"
 *   groupLabel="Select features"
 *   :options="[
 *     { label: 'Auto-save', value: 'autosave' },
 *     { label: 'Dark mode', value: 'darkmode' },
 *     { label: 'Notifications', value: 'notifications' }
 *   ]"
 *   direction="vertical"
 * />
 * ```
 * 
 * @example With Validation
 * ```vue
 * <CheckBoxGroup
 *   v-model="interests"
 *   groupLabel="Select at least one interest"
 *   :options="interestOptions"
 *   :required="true"
 *   errorMessage="Please select at least one option"
 *   icon="star"
 *   tooltip="Choose your areas of interest"
 * />
 * ```
 */
-->
<template>
  <!--
    UnifiedCheckbox Component
    - Supports both single and grouped checkbox modes
    - If `options` array is provided (length > 0), renders group mode
    - Otherwise renders a standalone checkbox based on `value` and `label` props
    - Emits `update:modelValue` on change
  -->
  <!-- Group Mode -->
  <div
    v-if="isGroup"
    :class="[
      labelPosition === 'top' ? 'flex flex-col' : 'flex items-center',
      'gap-x-6 gap-y-2',
    ]"
    role="group"
    :aria-required="required"
  >
    <!-- Optional group label -->
    <label
      v-if="groupLabel"
      class="text-primary-100 text-lg flex items-center gap-2 font-semibold w-4/12 text-right whitespace-nowrap"
      ><Icon v-if="icon" :name="icon" /> {{ groupLabel }}
      <span
        v-if="tooltip"
        class="flex items-center justify-center px-1.5 aspect-square bg-secondary-100 text-white rounded-full cursor-pointer"
        :title="tooltip"
      >
        <Icon name="fa6-solid:question" />
      </span>
    </label>
    <div
      :class="
        direction === 'horizontal' ? 'flex gap-2' : 'flex flex-col space-y-3'
      "
    >
      <!-- Iterate over options array -->
      <label
        v-for="opt in options"
        :key="opt.value"
        :class="[
          'flex items-center gap-1 cursor-pointer select-none relative',
          disabled ? 'opacity-60 cursor-not-allowed' : '',
          errorMessage ? 'text-red-600' : '',
        ]"
      >
        <!-- Hidden native checkbox input -->
        <input
          type="checkbox"
          :name="name"
          :value="opt.value"
          :checked="Array.isArray(modelValue) && modelValue.includes(opt.value)"
          :disabled="disabled"
          @change="onGroupChange(opt.value, $event)"
          class="absolute opacity-0 pointer-events-none"
          :aria-invalid="!!errorMessage"
          :aria-required="required"
        />
        <!-- Custom checkbox mark -->
        <span
          class="w-4 h-4 flex items-center justify-center border-2 rounded transition-all duration-200"
          :class="
            Array.isArray(modelValue) && modelValue.includes(opt.value)
              ? 'bg-secondary-100 border-secondary-100'
              : 'border-gray-300'
          "
        >
          <svg
            v-if="Array.isArray(modelValue) && modelValue.includes(opt.value)"
            class="w-3 h-3 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </span>
        <!-- Option label text -->
        <span class="text-gray-800">{{ opt.label }}</span>
      </label>
    </div>

    <!-- Error message below group -->
    <p v-if="errorMessage" class="text-red-600 text-sm mt-1">
      {{ errorMessage }}
    </p>
  </div>

  <!-- Single Mode -->
  <div
    v-else
    :class="[
      'flex items-center gap-x-2 relative',
      disabled ? 'opacity-60 cursor-not-allowed' : '',
      errorMessage ? 'text-red-600' : '',
    ]"
  >
    <!-- Hidden native checkbox input -->
    <input
      :id="id"
      type="checkbox"
      :name="name"
      :value="value"
      :checked="modelValue"
      :disabled="disabled"
      @change="onSingleChange($event)"
      class="absolute opacity-0 pointer-events-none"
      :aria-invalid="!!errorMessage"
      :aria-required="required"
    />
    <!-- Custom checkbox mark and label -->
    <label
      :for="id"
      class="flex text-primary-100 text-lg font-semibold items-center text-right whitespace-nowrap gap-1 cursor-pointer select-none"
    >
      <slot>
        <Icon v-if="icon" :name="icon" />
        {{ label }}

        <span
          v-if="tooltip"
          class="flex items-center justify-center px-1.5 aspect-square bg-secondary-100 text-white rounded-full cursor-pointer"
          :title="tooltip"
        >
          <Icon name="fa6-solid:question" /> </span
      ></slot>
    </label>
    <span
      class="w-4 h-4 flex items-center justify-center border-2 rounded transition-all duration-200"
      :class="
        modelValue ? 'bg-secondary-100 border-secondary-100' : 'border-gray-300'
      "
    >
      <svg
        v-if="modelValue"
        class="w-3 h-3 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </span>
    <!-- Error message below single checkbox -->
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
 * UnifiedCheckbox Component
 *
 * Props:
 * @prop {Array<{ label: string; value: string|number }>} options - If non-empty, renders as a group of checkboxes
 * @prop {boolean[] | string[] | number[]} modelValue - The currently selected values for group mode or boolean for single mode (v-model)
 * @prop {boolean} value - The value for standalone checkbox mode
 * @prop {string} name - Name attribute for the checkbox inputs (auto-generated if omitted)
 * @prop {string} label - Label text for standalone mode
 * @prop {'top'|'right'} labelPosition - Position of the label relative to the field
 * @prop {string} groupLabel - Label text above the group
 * @prop {'vertical'|'horizontal'} direction - Layout of group options
 * @prop {boolean} disabled - Disables all inputs
 * @prop {boolean} required - Marks inputs as required
 * @prop {string} errorMessage - Error text to display
 * @prop {string} icon - Optional icon name from lucide icons
 * @prop {string} tooltip - Tooltip text for the icon
 *
 * Emits:
 * @event update:modelValue - Emitted with the new value(s) on change
 */
import { ref, computed } from "vue";
import { nanoid } from "nanoid";
import type { PropType } from "vue";

const props = defineProps({
  options: {
    type: Array as PropType<Array<{ label: string; value: string | number }>>,
    default: () => [],
  },
  modelValue: {
    type: [Boolean, Array] as PropType<boolean | Array<string | number>>,
    default: false,
  },
  value: {
    type: [String, Number, Boolean] as PropType<string | number | boolean>,
    default: undefined,
  },
  name: {
    type: String,
    default: () => `cb-${Math.random().toString(36).slice(2)}`,
  },
  label: { type: String, default: "" },
  labelPosition: {
    type: String as PropType<"top" | "right">,
    default: "right",
  },
  groupLabel: { type: String, default: "" },
  direction: {
    type: String as PropType<"vertical" | "horizontal">,
    default: "vertical",
  },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  errorMessage: { type: String, default: "" },
  icon: { type: String, default: "" },
  tooltip: { type: String, default: "" },
});

// Emit event for v-model update
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean | Array<string | number>): void;
}>();

// Unique ID for standalone mode input/label pairing
const id = ref(`checkbox-${nanoid(6)}`);

// Determine mode based on presence of options array
const isGroup = computed(
  () => Array.isArray(props.options) && props.options.length > 0
);

/**
 * Handler for group checkbox change
 */
function onGroupChange(val: string | number, event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  const arr = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
  const idx = arr.indexOf(val);
  if (checked && idx === -1) arr.push(val);
  if (!checked && idx > -1) arr.splice(idx, 1);
  emit("update:modelValue", arr);
}

/**
 * Handler for single checkbox change
 */
function onSingleChange(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  emit("update:modelValue", checked);
}
</script>

<style scoped>
/* No CSS needed: Tailwind utilities are used throughout */
</style>
