<template>
  <!--
    InputField Component
    - Supports text, number, email, password, and textarea types
    - Displays a label either on top or on the right
    - Shows error messages and supports disabled state
    - Includes optional icon with tooltip or password visibility toggle
  -->
  <div
    :class="['input-div', { 'flex-col !items-start': labelPosition === 'top' }]"
  >
    <!-- Label (when provided) -->
    <label
      v-if="label"
      class="text-primary-100 text-lg flex items-center gap-2 font-semibold w-4/12 text-right whitespace-nowrap"
    >
      <Icon v-if="icon" :name="icon" />
      {{ label }}
    </label>

    <!-- Field wrapper for input/textarea and icons -->
    <div class="w-full relative">
      <!--
        Input element (for types other than textarea)
        - bound to modelValue via v-model pattern
        - type controlled by computedType (handles password toggle)
      -->
      <input
        v-if="type !== 'textarea'"
        :id="id"
        :type="computedType"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled"
        @input="$emit('update:modelValue', $event.target.value)"
        class="input"
        :class="{ '!border-red-600': errorMessage }"
      />

      <!--
        Textarea element (when type='textarea')
        - bound to modelValue via v-model pattern
      -->
      <textarea
        v-else
        :id="id"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled"
        @input="$emit('update:modelValue', $event.target.value)"
        class="input resize-none"
        :class="{ '': errorMessage }"
      ></textarea>

      <!--
        Password Toggle Icon
        - visible only for password type
        - toggles showPassword state
      -->
      <span
        v-if="type === 'password'"
        class="absolute top-1/2 transform -translate-y-1/2 left-4 cursor-pointer text-primary-100"
        @click="togglePassword"
      >
        <Icon :name="`fa6-solid:${showPassword ? 'eye-slash' : 'eye'}`" />
      </span>

      <!--
        Custom Icon with Tooltip
        - shows when icon prop is provided
        - displays tooltip text on hover
      -->
      <span
        v-else-if="icon"
        class="absolute top-1/2 transform flex items-center justify-center px-1.5 aspect-square bg-secondary-100 text-white rounded-full -translate-y-1/2 left-4 cursor-pointer"
        :title="tooltip"
      >
        <Icon name="fa6-solid:question" />
      </span>
    </div>

    <!--
      Error message display
      - shows when errorMessage prop is non-empty
    -->
    <p v-if="errorMessage" class="text-xs text-red-600 mt-1">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
/**
 * InputField.vue
 *
 * Props:
 * @prop {string|number} modelValue - Bound value for v-model
 * @prop {string} label - Optional label text
 * @prop {'top'|'right'} labelPosition - Position of the label relative to the field
 * @prop {string} placeholder - Placeholder text
 * @prop {'text'|'number'|'email'|'password'|'textarea'} type - Field type
 * @prop {boolean} disabled - Disables the field if true
 * @prop {string} errorMessage - Error message text
 * @prop {string} icon - Optional icon name from lucide icons
 * @prop {string} tooltip - Tooltip text for the icon
 */
import { ref, computed } from "vue";
import { nanoid } from "nanoid";
import type { PropType } from "vue";

// Define component props
const props = defineProps({
  modelValue: {
    type: [String, Number] as PropType<string | number>,
    default: "",
  },
  label: { type: String, default: "" },
  labelPosition: {
    type: String as PropType<"top" | "right">,
    default: "right",
  },
  placeholder: { type: String, default: "" },
  type: {
    type: String as PropType<
      "text" | "number" | "email" | "password" | "textarea"
    >,
    default: "text",
  },
  disabled: { type: Boolean, default: false },
  errorMessage: { type: String, default: "" },
  icon: { type: String, default: "" },
  tooltip: { type: String, default: "" },
});

// Emit update event for v-model compatibility
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

// Unique ID for accessibility linking label and field
const id = ref(`input-${nanoid(6)}`);

// Compute CSS class for optional box styling

// Password visibility toggle state
const showPassword = ref(false);
// Computed type switches between 'text' and 'password'
const computedType = computed(() => {
  return props.type === "password" && showPassword.value ? "text" : props.type;
});
// Toggle function for password visibility
function togglePassword() {
  showPassword.value = !showPassword.value;
}
</script>

<style lang="scss" scoped>
/*
  .input-div applies overall flex layout
  label and .input are styled based on provided SCSS
*/
.input-div {
  @apply relative flex flex-wrap md:flex-nowrap items-center gap-3 w-full px-4;
}
.input-div label {
  @apply text-primary-100 text-lg text-right whitespace-nowrap font-semibold w-4/12;
}
.input-div > div {
  @apply w-full;
}
.input,
textarea.input {
  @apply outline-0 px-4 py-2 border-2 border-solid border-gray-100 rounded-lg w-full focus:border-secondary-100;
}
.input:read-only,
textarea.input:read-only,
.input.read-only,
textarea.input.read-only {
  @apply bg-gray-100 border-primary-10;
}
</style>
