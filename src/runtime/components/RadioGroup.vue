<!--
/**
 * @component RadioGroup
 * @description A versatile radio button component that supports both single radio and group modes
 * 
 * @features
 * 1. Dual Mode Operation:
 *    - Single Radio: Simple standalone radio button with label
 *    - Group Mode: Multiple radio options in a group
 * 
 * 2. Layout & Styling:
 *    - Custom styled radio buttons with smooth animations
 *    - Flexible label positioning (top/right)
 *    - Horizontal or vertical group layout
 *    - Consistent styling with design system
 * 
 * 3. Advanced Features:
 *    - Accessible (WAI-ARIA compliant)
 *    - Icon support with tooltips
 *    - Error state handling
 *    - Disabled state support
 *    - Required field validation
 * 
 * @example Single Radio Usage
 * ```vue
 * <RadioGroup
 *   v-model="agreed"
 *   label="I agree to terms"
 *   :value="true"
 * />
 * ```
 * 
 * @example Group Mode Usage
 * ```vue
 * <RadioGroup
 *   v-model="selectedOption"
 *   groupLabel="Select a plan"
 *   :options="[
 *     { label: 'Basic', value: 'basic' },
 *     { label: 'Pro', value: 'pro' },
 *     { label: 'Enterprise', value: 'enterprise' }
 *   ]"
 *   direction="vertical"
 * />
 * ```
 * 
 * @example With Icon and Tooltip
 * ```vue
 * <RadioGroup
 *   v-model="preference"
 *   label="Newsletter Subscription"
 *   icon="mail"
 *   tooltip="Choose your newsletter preference"
 *   :options="[
 *     { label: 'Daily', value: 'daily' },
 *     { label: 'Weekly', value: 'weekly' }
 *   ]"
 * />
 * ```
 */
-->
<template>
  <!--
    UnifiedRadio Component
    - Supports both single and grouped radio modes in one component
    - If `options` array is provided (length > 0), renders group mode
    - Otherwise renders a standalone radio based on `value` and `label` props
    - Emits `update:modelValue` on change
  -->
  <!-- Group Mode -->
  <div
    v-if="isGroup"
    :class="[
      labelPosition === 'top' ? 'flex flex-col' : 'flex',
      'gap-x-6 gap-y-2',
    ]"
    role="radiogroup"
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
        <!-- Hidden native radio input -->
        <input
          type="radio"
          :name="name"
          :value="opt.value"
          :checked="modelValue === opt.value"
          :disabled="disabled"
          @change="$emit('update:modelValue', opt.value)"
          class="absolute opacity-0 pointer-events-none"
          :aria-invalid="!!errorMessage"
          :aria-required="required"
        />
        <!-- Custom radio mark -->
        <span
          class="w-4 h-4 flex items-center justify-center border-2 rounded-full flex-shrink-0 transition-all duration-200"
          :class="
            modelValue === opt.value
              ? 'bg-secondary-100 border-secondary-100'
              : 'border-gray-300'
          "
        >
          <span
            v-if="modelValue === opt.value"
            class="block w-2 h-2 aspect-square bg-white rounded-full"
          ></span>
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
      'flex items-center gap-x-4 relative',
      disabled ? 'opacity-60 cursor-not-allowed' : '',
      errorMessage ? 'text-red-600' : '',
    ]"
  >
    <!-- Hidden native radio input -->
    <input
      :id="id"
      type="radio"
      :name="name"
      :value="value"
      :checked="modelValue === value"
      :disabled="disabled"
      @change="() => emit('update:modelValue', value)"
      class="absolute opacity-0 pointer-events-none"
      :aria-invalid="!!errorMessage"
      :aria-required="required"
    />
    <!-- Custom radio mark and label -->
    <label
      :for="id"
      class="flex text-primary-100 text-lg font-semibold items-center text-right whitespace-nowrap  gap-1 cursor-pointer select-none"
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
      class="w-4 h-4 flex items-center justify-center border-2 rounded-full flex-shrink-0 transition-all duration-200"
      :class="
        modelValue === value
          ? 'bg-secondary-100 border-secondary-100'
          : 'border-gray-300'
      "
    >
      <span
        v-if="modelValue === value"
        class="block w-2 h-2 bg-white rounded-full aspect-square"
      ></span>
    </span>
    <!-- Error message below single radio -->
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
 * UnifiedRadio Component
 *
 * Props:
 * @prop {Array<{ label: string; value: string|number }>} options - If non-empty, renders as a group of radios
 * @prop {string|number} modelValue - The currently selected value (v-model)
 * @prop {string|number} value - The value for standalone radio mode
 * @prop {string} name - Name attribute for the radio inputs (auto-generated if omitted)
 * @prop {string} label - Label text for standalone mode
 * @prop {string} groupLabel - Label text above the group
 * @prop {'top'|'right'} labelPosition - Position of the label relative to the field
 * @prop {'vertical'|'horizontal'} direction - Layout of group options
 * @prop {boolean} disabled - Disables all inputs
 * @prop {boolean} required - Marks inputs as required
 * @prop {string} errorMessage - Error text to display
 * @prop {string} icon - Optional icon name from lucide icons
 * @prop {string} tooltip - Tooltip text for the icon
 *
 * Emits:
 * @event update:modelValue - Emitted with the new value on change
 */
import { nanoid } from "nanoid";
import { computed, ref, type PropType } from "vue";

const props = defineProps({
  options: {
    type: Array as PropType<Array<{ label: string; value: string | number }>>,
    default: () => [],
  },
  modelValue: {
    type: [String, Number] as PropType<string | number | boolean>,
    default: undefined,
  },
  value: {
    type: [String, Number] as PropType<string | number>,
    default: undefined,
  },
  name: {
    type: String,
    default: () => `rg-${Math.random().toString(36).slice(2)}`,
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
  (e: "update:modelValue", value: string | number): void;
}>();

// Unique ID for standalone mode input/label pairing
const id = ref(`radio-${nanoid(6)}`);

// Determine mode based on presence of options array
const isGroup = computed(
  () => Array.isArray(props.options) && props.options.length > 0
);
</script>
