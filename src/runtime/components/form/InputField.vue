<!--
/**
 * @component InputField
 * @description A versatile input field component that supports various input types and features
 * 
 * @features
 * - Multiple input types: text, number, email, password, textarea, date, time, datetime
 * - Label positioning: top or right alignment
 * - Input masking with IMask support
 * - Prefix and suffix support
 * - Password strength meter and generator
 * - Date picker integration (Persian/Gregorian calendar)
 * - Error message display
 * - Icon support with tooltips
 * - Disabled state support
 * - RTL/LTR support
 * 
 * @props {string|number|Date|Array} modelValue - The v-model value
 * @props {string} label - Input label text
 * @props {string} labelPosition - Label position ('top' or 'right')
 * @props {string} placeholder - Input placeholder text
 * @props {string} type - Input type (text/number/email/password/textarea/date/time/datetime)
 * @props {boolean} disabled - Disabled state
 * @props {string} errorMessage - Error message to display
 * @props {string} icon - Icon name for the label
 * @props {string} tooltip - Tooltip text for the icon
 * @props {object|string} mask - IMask configuration for number formatting
 * @props {string} prefix - Text or symbol to show before input
 * @props {string} suffix - Text or symbol to show after input
 * @props {boolean} passwordOptions - Enable password features (strength meter + generator)
 * @props {string} inputFormat - Date format for input (YYYY-MM-DD)
 * @props {string} displayFormat - Date format for display
 * @props {boolean} clearable - Allow clearing date value
 * @props {boolean} single - Single or multiple date selection
 * @props {string} calendarType - Calendar type (persian/gregorian)
 * 
 * @emits {update:modelValue} - Emitted when the input value changes
 * 
 * @example Basic usage
 * <InputField
 *   v-model="value"
 *   label="Username"
 *   type="text"
 *   placeholder="Enter username"
 * />
 * 
 * @example With mask and prefix (for currency)
 * <InputField
 *   v-model="price"
 *   type="number"
 *   :mask="{ mask: Number, thousandsSeparator: ',' }"
 *   prefix="$"
 *   label="Price"
 * />
 * 
 * @example Persian date picker
 * <InputField
 *   v-model="date"
 *   type="date"
 *   calendarType="persian"
 *   :clearable="true"
 *   label="تاریخ"
 *   inputFormat="YYYY/MM/DD"
 * />
 * 
 * @example Password with strength meter
 * <InputField
 *   v-model="password"
 *   type="password"
 *   :passwordOptions="true"
 *   label="Password"
 *   tooltip="Must be at least 8 characters"
 * />
 * 
 * @example Textarea with error
 * <InputField
 *   v-model="description"
 *   type="textarea"
 *   label="Description"
 *   errorMessage="This field is required"
 * />
 */
-->
<template>
  <!--
    InputField Component
    - Supports text, number, email, password, textarea, date, time, datetime types
    - Displays a label either on top or on the right
    - Shows error messages and supports disabled state
    - Includes optional icon with tooltip or password visibility toggle
    - For date/time types uses vue3-persian-datetime-picker with full options
  -->
  <div :class="[
    'input-div',
    { 'flex-col !items-start label-top ': labelPosition === 'top' },
  ]">
    <!-- Label -->
    <label v-if="label" :for="id"
      class="text-primary-100 text-lg flex items-center gap-2 font-semibold w-4/12 text-right whitespace-nowrap">
      <Icon v-if="icon" :name="icon" />
      {{ label }}
    </label>

    <!-- Field wrapper -->
    <div class="w-full relative">
      <!-- Date/Time Picker -->
      <!-- {{ displayFormat }}- {{ inputFormat }}- {{ innerValue }}- {{ calendarType }} -->

      <DatePicker v-if="isDateType" v-model="innerValue" :type="type" :format="inputFormat"
        :display-format="displayFormat" :locale="locale" :placeholder="placeholder" :clearable="clearable"
        :disabled="disabled" :mode="single && !range ? 'single' : 'reange'" class="w-full" />

      <div v-else-if="type !== 'textarea'"
        class="w-full relative flex items-stretch input focus:border-secondary-100 bg-white !p-0 overflow-hidden">
        <!-- اگر mask پر شده، از imask و prefix/suffix استفاده کن -->
        <!-- پیشوند -->
        <span v-if="prefix" class="px-2 bg-gray-100 text-gray-600 text-xs flex items-center justify-center">{{ prefix
          }}</span>
        <!-- خود input با ماسک -->
        <!-- Standard Input/Textarea -->
        <input v-imask="maskOptions" v-model="maskedValue" :id="id" :placeholder="placeholder" :disabled="disabled"
          :type="computedType" :class="{
            '!border-red-600': errorMessage,
            '!rounded-r': prefix,
            '!rounded-l': suffix,
          }" class="input flex-1 outline-none px-2 py-1 !border-none" />
        <!-- پسوند -->
        <span v-if="suffix" class="px-2 bg-gray-100 text-gray-600 text-xs flex items-center justify-center">{{ suffix
          }}</span>
      </div>
      <textarea v-else :id="id" :placeholder="placeholder" :value="modelValue" :disabled="disabled"
        @input="$emit('update:modelValue', $event.target.value)" class="input resize-none"></textarea>
      <div v-if="type === 'password' && !disabled && passwordOptions"
        class="flex gap-4 items-center mt-4 justify-between px-2">
        <div class="h-2 mt-2 bg-gray-200 rounded-lg flex items-stretch justify-end">
          <div :style="{ width: strength.percent + '%' }" class="bg-green-800 h-full transition-width rounded-lg"></div>
        </div>
        <CustomeButton @click="generatePassword" class="text-xs bg-secondary-70 text-white">generate</CustomeButton>
      </div>

      <!-- Password Toggle Icon -->
      <span v-if="type === 'password'" class="absolute top-[0.75rem] left-4 cursor-pointer text-primary-100"
        @click="togglePassword">
        <Icon :name="`fa6-solid:${showPassword ? 'eye-slash' : 'eye'}`" />
      </span>

      <!-- Tooltip Icon -->
      <span v-else-if="tooltip"
        class="absolute top-[20px] transform flex items-center justify-center px-1.5 aspect-square bg-secondary-100 text-white rounded-full -translate-y-1/2 left-4 cursor-pointer"
        :class="{ 'left-8': suffix }" :title="tooltip">
        <Icon name="fa6-solid:question" />
      </span>
      <!-- Error message -->
      <p v-if="errorMessage" class="text-xs text-red-600 mt-1">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Component Logic for InputField
 *
 * Features implemented:
 * 1. Unique ID generation for input elements
 * 2. Password strength calculation and toggle visibility
 * 3. Date picker integration with format handling
 * 4. Input masking with IMask
 * 5. Value synchronization with v-model
 */
import { toRef } from "vue";
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

import { nanoid } from "nanoid";
import type { PropType } from "vue";
import { IMask, IMaskDirective } from "vue-imask";

defineOptions({
  directives: {
    imask: IMaskDirective as any,
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
  passwordOptions: { type: Boolean, default: true },
  // DatePicker-specific props
  inputFormat: { type: String, default: "YYYY/MM/DD" }, // فرمت v-model
  displayFormat: { type: String, default: "YYYY/MM/DD" }, // فرمتِ نمایش داخل input

  clearable: { type: Boolean, default: false },

  // single/range: در این پکیج range با یک بولین کنترل می‌شود
  single: { type: Boolean, default: true }, // برای سازگاری با قبل
  range: { type: Boolean, default: false }, // اگر true باشد v-model آرایه است

  // تقویم: میلادی/شمسی از طریق locale کنترل می‌شود
  calendarType: {
    type: String as PropType<"persian" | "gregorian">,
    default: "persian",
  },
});
const emit = defineEmits<{
  (e: "update:modelValue", value: any): void;
}>();

const valueRef = ref<string | number>("");
const locale = computed(() =>
  props.calendarType === "gregorian" ? "en" : "fa"
);

// پردازش ماسک
const rawMask = toRef(props, "mask");
const maskOptions = computed(() => {
  if (typeof rawMask.value === "object" && rawMask.value !== null) {
    const options = { ...rawMask.value };
    delete options.unmask; // حذف unmask از تنظیمات ماسک
    return options;
  }
  return rawMask.value;
});

// تبدیل مقدار به عدد خالص
const toNumericValue = (val: any): number | "" => {
  if (!val && val !== 0) return "";
  const numStr = val.toString().replace(/[^\d.-]/g, "");
  return numStr ? Number(numStr) : "";
};

// مدیریت مقدار نمایشی و واقعی
const maskedValue = computed({
  get: () => valueRef.value ?? "",
  set: (val: any) => {
    valueRef.value = val;
    if (typeof rawMask.value === "object" && rawMask.value?.unmask) {
      emit("update:modelValue", toNumericValue(val));
    } else {
      emit("update:modelValue", val);
    }
  },
});

// به روز رسانی مقدار داخلی وقتی prop تغییر می‌کند
watch(
  () => props.modelValue,
  (newVal) => {
    valueRef.value = newVal ?? "";
  },
  { immediate: true }
);

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
const innerValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit("update:modelValue", value);
  },
});
</script>
