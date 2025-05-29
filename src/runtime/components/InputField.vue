<template>
  <!--
    InputField Component
    - Supports text, number, email, password, textarea, date, time, datetime types
    - Displays a label either on top or on the right
    - Shows error messages and supports disabled state
    - Includes optional icon with tooltip or password visibility toggle
    - For date/time types uses vue3-persian-datepicker with full options
  -->
  <div
    :class="['input-div', { 'flex-col !items-start': labelPosition === 'top' }]"
  >
    <!-- Label -->
    <label
      v-if="label"
      :for="id"
      class="text-primary-100 text-lg flex items-center gap-2 font-semibold w-4/12 text-right whitespace-nowrap"
    >
      <Icon v-if="icon" :name="icon" />
      {{ label }}
    </label>

    <!-- Field wrapper -->
    <div class="w-full relative">
      <!-- Date/Time Picker -->
      <DatePicker
        v-if="isDateType"
        ref="picker"
        v-model="innerValue"
        :type="type"
        :input-format="inputFormat"
        :display-format="displayFormat"
        :placeholder="placeholder"
        :clearable="clearable"
        :calendar-type="calendarType"
        :disabled="disabled"
        :mode="single ? 'single' : 'multiple'"
        :column="1"
        @submit="onDateChange"
        class="w-full"
        :style="{
          '--primary-color': primary,
          '--secondary-color': secondary,
        }"
      />
      <div
        v-else-if="type !== 'textarea'"
        class="w-full relative flex items-stretch input focus:border-secondary-100 bg-white !p-0 overflow-hidden"
      >
        <!-- اگر mask پر شده، از imask و prefix/suffix استفاده کن -->
        <!-- پیشوند -->
        <span
          v-if="prefix"
          class="px-2 bg-gray-100 text-gray-600 text-xs flex items-center justify-center"
          >{{ prefix }}</span
        >
        <!-- خود input با ماسک -->
        <!-- Standard Input/Textarea -->
        <input
          v-imask="maskOptions"
          v-model="maskedValue"
          :id="id"
          :placeholder="placeholder"
          :disabled="disabled"
          :type="computedType"
          :class="{
            '!border-red-600': errorMessage,
            '!rounded-r': prefix,
            '!rounded-l': suffix,
          }"
          class="input flex-1 outline-none px-2 py-1 !border-none"
        />
        <!-- پسوند -->
        <span
          v-if="suffix"
          class="px-2 bg-gray-100 text-gray-600 text-xs flex items-center justify-center"
          >{{ suffix }}</span
        >
      </div>
      <!-- Error message -->
      <p v-if="errorMessage" class="text-xs text-red-600 mt-1">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * InputField.vue
 *
 * Supports:
 * - Types: text, number, email, password, textarea
 * - Date/Time: date, time, datetime with Persian/Gregorian, range, clearable
 * - Label positioning: top or right
 * - Disabled, error states, icons, tooltips
 */
import { ref, computed, toRef } from "vue";
import { nanoid } from "nanoid";
import type { PropType } from "vue";
import { IMaskDirective } from "vue-imask"; // For masking input
defineOptions({
  directives: {
    imask: IMaskDirective,
  },
});
const props = defineProps({
  modelValue: {
    type: [String, Number, Date, Array] as PropType<
      string | number | Date | (string | Date)[]
    >,
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
      | "text"
      | "number"
      | "email"
      | "password"
      | "textarea"
      | "date"
      | "time"
      | "datetime"
    >,
    default: "text",
  },
  disabled: { type: Boolean, default: false },
  errorMessage: { type: String, default: "" },
  icon: { type: String, default: "" },
  tooltip: { type: String, default: "" },
  mask: { type: [Object, String], default: null }, // e.g. { mask: Number, thousandsSeparator: ',' }
  prefix: { type: String, default: "" }, // e.g. 'تومان'
  suffix: { type: String, default: "" },
  // password-specific props
  paswordOptions: { type: Boolean, default: true },
  // DatePicker-specific props
  inputFormat: { type: String, default: "YYYY-MM-DD" },
  displayFormat: { type: String, default: "YYYY-MM-DD" },
  clearable: { type: Boolean, default: false },
  single: { type: Boolean, default: true },
  calendarType: {
    type: String as PropType<"persian" | "gregorian">,
    default: "persian",
  },
});
// ////////////////////
const rawMask = toRef(props, 'mask')
const maskOptions = computed(() => {
  if (typeof rawMask.value === 'object' && rawMask.value !== null) {
    return { ...rawMask.value, unmask: true }
  }
  return rawMask.value
})
const maskedValue = computed({
  get: () => props.modelValue,
  set: (val: any) => emit('update:modelValue', val)
})
const displayValue = ref(props.modelValue); // مقداری که در input واقعاً نمایش داده می‌شود

// هر بار مدل خارجی تغییر کند، نمایش را هم بروزرسانی می‌کنیم
watch(
  toRef(props, "modelValue"),
  (val) => {
    displayValue.value = val;
  },
  { immediate: true }
);
const emit = defineEmits<{
  (e: "update:modelValue", value: any): void;
}>();


// Unique ID
const id = ref(`input-${nanoid(6)}`);
// state برای سنجش قدرت
const strength = computed(() => {
  let pwd = props.modelValue as string;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return { score, percent: (score / 5) * 100 };
});
// تولید رمز تصادفی
function generatePassword() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let pwd = "";
  for (let i = 0; i < 12; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // بروزرسانی ورودی و سنجش مجدد
  emit("update:modelValue", pwd);
}

// Password toggle
const showPassword = ref(false);
const computedType = computed(() =>
  props.type === "password" && showPassword.value ? "text" : props.type
);
function togglePassword() {
  showPassword.value = !showPassword.value;
}

// Date type check
const isDateType = computed(() =>
  ["date", "time", "datetime"].includes(props.type)
);
// Manage internal date value for v-model compatibility
const innerValue = ref<any>(props.modelValue);
watch(toRef(props, "modelValue"), (v) => {
  innerValue.value = v;
});
function onDateChange(val: any) {
  emit("update:modelValue", val);
}
</script>

<style lang="scss" scoped>
.input-div {
  @apply relative flex flex-wrap md:flex-nowrap items-center gap-3 w-full px-4;
}
.input-div label {
  @apply text-primary-100 text-lg text-right whitespace-nowrap font-semibold w-4/12;
}
.input-div > div {
  @apply w-full;
}
.input {
  @apply outline-0 px-4 py-2 border-2 border-solid border-gray-100 rounded-lg w-full ;
  &[type="color"] {
    @apply py-1;
  }
}
.input:read-only,
textarea.input:read-only,
.input.read-only,
textarea.input.read-only {
  @apply bg-gray-100 border-primary-10;
}
</style>
