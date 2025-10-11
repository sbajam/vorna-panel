<template>
  <div class="form-builder w-full">
    <!-- عنوان فرم و آیکون ذخیره دستی -->
    <div class="flex items-center justify-between mb-4">
      <Header v-if="config.formProps.title?.trim().length">
        {{ config.formProps.title }}
      </Header>
      <div v-else></div>
      <!-- آیکون کلیپبورد برای ذخیره دستی -->
      <div
        v-if="props.config.formProps.autoSaveKey"
        class="flex items-center ml-4 px-4 py-2 rounded-lg border border-gray-50 shadow-md gap-x-4"
      >
        <Icon
          v-if="config.formProps.autoSaveKey"
          name="fa6-solid:clipboard"
          title="ذخیره کردن فرم"
          class="text-2xl text-blue-800 cursor-pointer"
          @click="saveNow"
        />
        <Icon
          v-if="config.formProps.autoSaveKey"
          name="fa6-solid:trash"
          title="خالی کردن فرم"
          class="text-2xl text-red-700 cursor-pointer"
          @click="clearNow"
        />
      </div>
    </div>

    <!-- حالت Loading: Spinner -->
    <div
      v-if="
        config.formProps.loading && config.formProps.loadingMode === 'spinner'
      "
      class="flex justify-center items-center h-64"
    >
      <Spinner size="48px" borderWidth="4px" color="primary-100" />
    </div>

    <!-- حالت Loading: Skeleton -->
    <div
      v-else-if="
        config.formProps.loading && config.formProps.loadingMode === 'skeleton'
      "
    >
      <div :class="gridClass">
        <!-- اگر sections داریم -->
        <template
          v-for="section in config.sections || [
            { title: '', fields: config.fields },
          ]"
          :key="section.title || 'default'"
        >
          <template v-for="field in section.fields" :key="field.key">
            <div
              :class="`col-span-1 md:col-span-${resolveResponsive(
                field.layout?.colSpan,
                1
              )}`"
            >
              <div
                class="animate-pulse bg-gray-200 h-10 w-full rounded mb-2"
              ></div>
              <div class="animate-pulse bg-gray-200 h-4 w-1/2 rounded"></div>
            </div>
          </template>
        </template>
      </div>
      <div class="mt-6 flex justify-center">
        <div class="animate-pulse bg-gray-200 h-10 w-1/3 rounded"></div>
      </div>
    </div>

    <!-- فرم اصلی وقتی loading=false -->
    <div v-else-if="config.formProps.loading === false">
      <div
        class="h-fit rounded md:p-4 relative"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        <!-- اگر بخش‌بندی (sections) داریم -->
        <template v-if="config.sections">
          <div v-for="(section, sidx) in config.sections" :key="sidx">
            <!-- سربرگ سکشن -->
            <div
              v-if="section.title"
              :class="{ 'mt-8': sidx > 0 }"
              @click="toggleSection(sidx)"
              class="cursor-pointer flex gap-2 items-center flex-row-reverse justify-end bg-gray-100 p-2 rounded-t"
            >
              <h3 class="font-semibold">{{ section.title }}</h3>
              <div
                v-if="section.collapsible"
                class="flex items-center justify-center w-6 h-6 rounded-full aspect-square text-white bg-primary-100"
              >
                <Icon
                  :name="`fa6-solid:${
                    sectionOpenStates[sidx] ? 'chevron-down' : 'chevron-left'
                  }`"
                />
              </div>
            </div>
            <!-- محتوای بخش -->
            <Vue3SlideUpDown v-model="sectionOpenStates[sidx]">
              <div class="mt-2 px-2">
                <div :class="gridClass">
                  <template v-for="field in section.fields" :key="field.key">
                    <div
                      v-if="!field.showIf || field.showIf(formValues)"
                      :class="[
                        `col-span-1 md:col-span-${resolveResponsive(
                          field.layout?.colSpan,
                          1
                        )}`,
                        {
                          'ring-2 ring-blue-400': field.key === activeFieldKey,
                        },
                      ]"
                      @click.stop="selectField(field.key)"
                    >
                      <component
                        v-if="field.type !== 'array'"
                        :is="getComponentByType(field.type)"
                        v-model="formValues[field.key]"
                        v-bind="buildFieldProps(field)"
                        @update:modelValue="onFieldUpdate(field.key)"
                      />
                      <FieldArray
                        v-else
                        v-model="formValues[field.key]"
                        :itemFields="field.itemFields || []"
                        :minItems="field.minItems"
                        :maxItems="field.maxItems"
                        :disabled="config.formProps.disabledAll"
                        :label="field.label || ''"
                      />
                    </div>
                  </template>
                </div>
              </div>
            </Vue3SlideUpDown>
          </div>
        </template>

        <!-- اگر بخش‌بندی نداریم -->
        <template v-else>
          <div :class="gridClass">
            <template v-for="field in config.fields" :key="field.key">
              <div
                v-if="!field.showIf || field.showIf(formValues)"
                :class="[
                  `col-span-1 md:col-span-${resolveResponsive(
                    field.layout?.colSpan,
                    1
                  )}`,
                  { 'ring-2 ring-blue-400': field.key === activeFieldKey },
                ]"
                @click.stop="selectField(field.key)"
              >
                <component
                  v-if="field.type !== 'array'"
                  :is="getComponentByType(field.type)"
                  v-model="formValues[field.key]"
                  v-bind="buildFieldProps(field)"
                  @update:modelValue="onFieldUpdate(field.key)"
                />
                <FieldArray
                  v-else
                  v-model="formValues[field.key]"
                  :itemFields="field.itemFields || []"
                  :minItems="field.minItems"
                  :maxItems="field.maxItems"
                  :disabled="config.formProps.disabledAll"
                  :label="field.label || ''"
                />
              </div>
            </template>
          </div>
        </template>
      </div>
      <!-- پیام خطای کلی فرم -->
      <div v-if="formLevelError" class="mt-4 text-red-600 text-center">
        {{ formLevelError }}
      </div>

      <!-- دکمه Submit -->
      <div class="mt-6 flex justify-center">
        <Button
          @click="onSubmit"
          :pending="config.submitButton.pending"
          :variant="config.submitButton.variant || 'solid'"
          :color="config.submitButton.color || 'primary-100'"
          :size="config.submitButton.size || 'lg'"
          :fullWidth="config.submitButton.fullWidth || false"
          :rounded="config.submitButton.rounded || 'lg'"
          type="submit"
        >
          {{ config.submitButton.text }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  computed,
  onMounted,
  onUnmounted,
  nextTick,
  watch,
} from "vue";

import InputField from "../InputField.vue";
import DropDown from "../DropDown.vue";
import CheckBoxGroup from "../CheckBoxGroup.vue";
import RadioGroup from "../RadioGroup.vue";
import ToggleSwitch from "../ToggleSwitch.vue";
import Button from "../../Button.vue";
import Spinner from "../../Spinner.vue";
import FieldArray from "./FieldArray.vue";
import { Vue3SlideUpDown } from "vue3-slide-up-down";
import TagsField from "../TagsField.vue";
import FileField from "../FileField.vue";
import RichTextField from "../RichTextField.vue";

const props = defineProps<{
  config: FormConfig;
  initialValues?: Record<string, any>;
  activeFieldKey?: string | null;
}>();

const emit = defineEmits<{
  (e: "submitForm", values: Record<string, any>): void;
  (e: "validationError", payload: { field: string; message: string }): void;
  (e: "fieldChanged", payload: { key: string; value: any }): void;
  (e: "addField", type: string): void;
  (e: "selectField", key: string): void;
}>();
function onFieldUpdate(key: string) {
  // v-model خودش formValues[key] را ست کرده؛ فقط ولیدیت کن
  queueMicrotask(() => runValidation(key)); // امن؛ لاپله‌ی بعد از رندر
}
// Expose resetForm method
defineExpose({
  resetForm() {
    // پیدا کردن فیلد براساس key
    const getField = (key: string): FieldConfig | undefined => {
      if (allSections.length) {
        return allSections.flatMap((s) => s.fields).find((f) => f.key === key);
      }
      return allFields.find((f) => f.key === key);
    };

    // ریست کردن همه فیلدها به مقدار اولیه
    Object.keys(formValues).forEach((key) => {
      const field = getField(key);
      if (!field) return;

      switch (field.type) {
        case "checkboxGroup":
          formValues[key] = [];
          break;
        case "radioGroup":
          formValues[key] = "";
          break;
        case "toggle":
          formValues[key] = false;
          break;
        case "select":
          formValues[key] = field.multiple ? [] : null;
          break;
        case "file":
          formValues[key] = field.multipleFile ? [] : null;
          break;
        case "array":
          formValues[key] = [];
          break;
        case "number":
          formValues[key] = null;
          break;
        case "date":
        case "time":
        case "datetime":
          formValues[key] = "";
          break;
        case "richtext":
          formValues[key] = "";
          break;
        default: // برای text, email, password, textarea و غیره
          formValues[key] = "";
      }
      formErrors[key] = ""; // پاک کردن خطاها
    });

    formLevelError.value = ""; // پاک کردن خطای کلی فرم
  },
});

// IndexedDB helper (بی‌تغییر از قبل)

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("FormBuilderDB", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("formStore")) {
        db.createObjectStore("formStore");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbSet(key: string, value: any) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction("formStore", "readwrite");
    tx.objectStore("formStore").put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet(key: string): Promise<any> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("formStore", "readonly");
    const req = tx.objectStore("formStore").get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
// کش URLهای اولیه‌ی فیلدهای فایل
const initialFileUrls = reactive<Record<string, string[]>>({});
// TypeScript Interfaces (بی‌تغییر از قبل)
interface ValidatorConfig {
  type: string;
  value?: any;
  field?: string;
  pattern?: string;
  message: string;
  validator?: (val: any, all: Record<string, any>) => boolean;
}

interface ResponsiveProp<T> {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}

interface FieldConfig {
  range: boolean;
  key: string;
  type: string;
  label?: string;
  labelPosition?: ResponsiveProp<"top" | "right">;
  placeholder?: string;
  validators?: ValidatorConfig[];
  showIf?: (values: Record<string, any>) => boolean;
  layout?: { colSpan?: ResponsiveProp<number> };

  mask?: any | string;
  prefix?: string;
  suffix?: string;
  passwordOptions?: boolean;

  inputFormat?: string;
  displayFormat?: string;
  clearable?: boolean;
  single?: boolean;
  calendarType?: "persian" | "gregorian";

  items?: Array<{ label: string; value: any }>;
  multiple?: boolean;
  searchable?: boolean;
  clearableSelect?: boolean;
  labelField?: string;
  valueField?: string;
  displayField?: string;
  options?: Array<{ label: string; value: any }>;
  direction?: ResponsiveProp<"vertical" | "horizontal">;
  groupLabel?: string;
  emptyMessage: string;

  size?: "sm" | "md" | "lg";
  onColor?: string;
  offColor?: string;

  accept?: string;
  multipleFile?: boolean;
  maxFiles?: number;
  maxSize?: number;
  isImageUploader?: boolean;
  watermark?: boolean;
  watermarkImage?: string;
  watermarkText?: string;
  aspectRatio?: string;
  showInfo?: boolean;
  infoText?: string;
  sizeClass?: string;
  uploadUrl?: string;

  image?: boolean;

  disabled?: boolean;
  tooltip?: string;
  icon?: string;

  itemFields?: FieldConfig[];
  minItems?: number;
  maxItems?: number;
}

interface SectionConfig {
  title: string;
  collapsible?: boolean;
  fields: FieldConfig[];
  _open?: boolean;
}

interface FormConfig {
  formProps: {
    title?: string;
    columns?: ResponsiveProp<number>;
    disabledAll?: boolean;
    loading?: boolean;
    loadingMode?: "skeleton" | "spinner" | "button";
    showErrorsAs?: "inline" | "notify";
    autoSaveKey?: string;
  };
  fields?: FieldConfig[];
  sections?: SectionConfig[];
  submitButton: {
    text: string;
    variant?: string;
    color?: string;
    size?: string;
    pending?: boolean;
    fullWidth?: boolean;
    rounded?: string;
  };
}

// ۱. تشخیص Breakpoint (responsive)
const windowWidth = ref(0);
onMounted(() => {
  windowWidth.value = window.innerWidth;
  window.addEventListener("resize", () => {
    windowWidth.value = window.innerWidth;
  });
});
onUnmounted(() => {
  window.removeEventListener("resize", () => {
    windowWidth.value = window.innerWidth;
  });
});
const currentBreakpoint = computed<"base" | "sm" | "md" | "lg" | "xl">(() => {
  if (windowWidth.value >= 1280) return "xl";
  if (windowWidth.value >= 1024) return "lg";
  if (windowWidth.value >= 768) return "md";
  if (windowWidth.value >= 640) return "sm";
  return "base";
});

function resolveResponsive<T>(
  prop: T | ResponsiveProp<T> | undefined,
  def: T
): T {
  if (prop == null) return def;
  if (typeof prop !== "object") return prop as T;

  const responsiveProp = prop as ResponsiveProp<T>;
  const br = currentBreakpoint.value;

  // Define breakpoint order from smallest to largest
  const breakpoints = ["base", "sm", "md", "lg", "xl"] as const;
  const currentIndex = breakpoints.indexOf(br);

  // Start with base value
  let value = responsiveProp.base ?? def;

  // Apply values from breakpoints up to current one
  for (let i = 1; i <= currentIndex; i++) {
    const breakpoint = breakpoints[i];
    if (responsiveProp[breakpoint] != null) {
      value = responsiveProp[breakpoint]!;
    }
  }

  return value;
}

// ۲. مجموعهٔ ماسک‌های آماده
const predefinedMasks: Record<string, any> = {
  onlyDigits: { mask: Number, thousandsSeparator: "" },
  commaSeparated: { mask: Number, thousandsSeparator: "," },
  mobile: { mask: "0000000000" },
  persianPhone: { mask: "0\\9999999999" },
};

// ۳. آماده‌سازی State فرم و خطاها
const formValues = reactive<Record<string, any>>({});
const formErrors = reactive<Record<string, string>>({});
const formLevelError = ref("");

// استخراج sections و fields مطمئن از props.config
const allSections: SectionConfig[] = props.config.sections || [];
const allFields: FieldConfig[] = props.config.fields || [];

// Local state for section open states to avoid mutating props
const sectionOpenStates = reactive<Record<number, boolean>>({});

// مقداردهی اولیه برای هر فیلد
allSections.forEach((section, index) => {
  sectionOpenStates[index] = true;
  (section.fields || []).forEach((field) => {
    const init = props.initialValues?.[field.key];

    // اگر فیلد فایلِ ImageUploader است و init از جنس URL/آرایه URL بود، در کش ذخیره کن
    if (field.type === "file" && field.isImageUploader === true) {
      const urls = Array.isArray(init)
        ? init
        : typeof init === "string"
        ? [init]
        : [];
      if (urls.length) {
        initialFileUrls[field.key] = urls;
        // مدل فایل را خالی نگه می‌داریم؛ نمایش با initialImages انجام می‌شود
        formValues[field.key] = field.multipleFile ? [] : null;
        formErrors[field.key] = "";
        return; // ادامه‌ی switch لازم نیست
      }
    }
    if (init != null) {
      formValues[field.key] = init;
    } else {
      switch (field.type) {
        case "checkboxGroup":
          formValues[field.key] = [];
          break;
        case "toggle":
          formValues[field.key] = false;
          break;
        case "file":
          formValues[field.key] = field.multipleFile ? [] : null;
          break;
        case "array":
          formValues[field.key] = [];
          break;
        default:
          formValues[field.key] = "";
          break;
      }
    }
    formErrors[field.key] = "";
  });
});

if (!allSections.length) {
  allFields.forEach((field) => {
    const init = props.initialValues?.[field.key];
    if (init != null) {
      formValues[field.key] = init;
    } else {
      switch (field.type) {
        case "checkboxGroup":
          formValues[field.key] = [];
          break;
        case "toggle":
          formValues[field.key] = false;
          break;
        case "file":
          formValues[field.key] = field.multipleFile ? [] : null;
          break;
        case "array":
          formValues[field.key] = [];
          break;
        default:
          formValues[field.key] = "";
          break;
      }
    }
    formErrors[field.key] = "";
  });
}

// Watcher for initialValues to update formValues when initialValues change
watch(
  () => props.initialValues,
  (newVals) => {
    if (!newVals) return;
    // به‌روزرسانی مدل
    Object.assign(formValues, newVals);

    // استخراج URLهای اولیه برای فیلدهای فایل
    const sourceFields = allSections.length
      ? allSections.flatMap((s) => s.fields || [])
      : allFields;
    sourceFields.forEach((field) => {
      if (field.type === "file" && field.isImageUploader === true) {
        const init = newVals[field.key];
        const urls = Array.isArray(init)
          ? init
          : typeof init === "string"
          ? [init]
          : [];
        if (urls.length) {
          initialFileUrls[field.key] = urls;
          // مدل فایل را خالی بگذار که کاربر اگر خواست، فایل جدید بده
          formValues[field.key] = field.multipleFile ? [] : null;
        }
      }
    });
  },
  { deep: true }
);

// ۴. ذخیرهٔ دوره‌ای هر ۲ دقیقه
let autoSaveInterval: number | null = null;

onMounted(async () => {
  // اگر autoSaveKey تعریف شده، هر ۲ دقیقه یک بار ذخیره کن
  if (props.config.formProps.autoSaveKey) {
    autoSaveInterval = window.setInterval(saveFormValues, 120000 /* 2 دقیقه */);

    // یکبار هم هنگام mount اگر دادهٔ ذخیره‌شده وجود دارد بارگذاری کن
    try {
      const saved = await idbGet(props.config.formProps.autoSaveKey!);
      if (saved) {
        Object.assign(formValues, saved);
      }
    } catch {
      // نادیده بگیر
    }
  }
});
// ایجاد watch برای formValues که تغییرات هر فیلد رو رهگیری کنه
watch(
  () => formValues, // watch کردن formValues
  (newValues, oldValues) => {
    emit("fieldChanged", JSON.parse(JSON.stringify(newValues)));

    // }
  },
  { deep: true }
);

onUnmounted(() => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }
});

// متدی که تغییرات را در IndexedDB ذخیره می‌کند
async function saveFormValues() {
  if (!props.config.formProps.autoSaveKey) return;
  try {
    await idbSet(
      props.config.formProps.autoSaveKey!,
      JSON.parse(JSON.stringify(formValues))
    );
  } catch {
    // نادیده بگیر
  }
}

// ذخیرهٔ دستی وقتی روی آیکون کلیک شود
function saveNow() {
  saveFormValues();
}
function clearNow() {
  if (props.config.formProps.autoSaveKey) {
    idbSet(props.config.formProps.autoSaveKey!, null).catch(() => {
      // نادیده بگیر
    });
  }

  // پیدا کردن فیلد براساس key
  const getField = (key: string): FieldConfig | undefined => {
    if (allSections.length) {
      return allSections.flatMap((s) => s.fields).find((f) => f.key === key);
    }
    return allFields.find((f) => f.key === key);
  };

  Object.keys(formValues).forEach((key) => {
    const field = getField(key);
    if (!field) return;

    // تنظیم مقدار پیش‌فرض براساس نوع فیلد
    switch (field.type) {
      case "checkboxGroup":
        formValues[key] = [];
        break;
      case "radioGroup":
        formValues[key] = "";
        break;
      case "toggle":
        formValues[key] = false;
        break;
      case "select":
        formValues[key] = field.multiple ? [] : null;
        break;
      case "file":
        formValues[key] = field.multipleFile ? [] : null;
        break;
      case "array":
        formValues[key] = [];
        break;
      case "number":
        formValues[key] = null;
        break;
      case "date":
      case "time":
      case "datetime":
        formValues[key] = "";
        break;
      case "richtext":
        formValues[key] = "";
        break;
      default: // برای text, email, password, textarea و غیره
        formValues[key] = "";
    }
    formErrors[key] = ""; // پاک کردن خطاها
  });

  formLevelError.value = ""; // پاک کردن خطای کلی فرم
}
// ۵. اعتبارسنجی (Validators)
function runValidation(key: string): boolean {
  const combinedFields: FieldConfig[] = allSections.length
    ? allSections.flatMap((s) => s.fields || [])
    : allFields;
  const field = combinedFields.find((f) => f.key === key);
  if (!field || !field.validators) return true;

  let errorMsg = "";
  const value = formValues[key];

  for (const v of field.validators!) {
    let valid = true;
    switch (v.type) {
      case "required": {
        let empty =
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0);

        // اگر فیلد فایلِ ImageUploader است و URL اولیه دارد، خالی محسوب نکن
        if (empty && field.type === "file" && field.isImageUploader === true) {
          const urls = initialFileUrls[field.key] || [];
          if (urls.length > 0) empty = false;
        }

        if (empty) valid = false;
        break;
      }
      case "minLength":
        if (typeof value === "string" && value.length < (v.value as number))
          valid = false;
        break;
      case "maxLength":
        if (typeof value === "string" && value.length > (v.value as number))
          valid = false;
        break;
      case "min":
        if (typeof value === "number" && value < (v.value as number))
          valid = false;
        break;
      case "max":
        if (typeof value === "number" && value > (v.value as number))
          valid = false;
        break;
      case "email": {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(value || "")) valid = false;
        break;
      }
      case "mobile": {
        const re = /^09\d{9}$/;
        if (!re.test(value || "")) valid = false;
        break;
      }
      case "phone": {
        const re = /^0[1-9]\d{7,8}$/;
        if (!re.test(value || "")) valid = false;
        break;
      }
      case "numeric":
        if (!/^\d+$/.test(value || "")) valid = false;
        break;
      case "alpha":
        if (!/^[A-Za-z]+$/.test(value || "")) valid = false;
        break;
      case "alphaNum":
        if (!/^[A-Za-z0-9]+$/.test(value || "")) valid = false;
        break;
      case "persianLetters":
        if (!/^[\u0600-\u06FF\s]+$/.test(value || "")) valid = false;
        break;
      case "regex": {
        const re = new RegExp(v.pattern as string);
        if (!re.test(value || "")) valid = false;
        break;
      }
      case "matchField":
        if (value !== formValues[v.field as string]) valid = false;
        break;
      case "custom":
        valid = (v.validator as Function)(value, formValues);
        break;
      default:
        break;
    }
    if (!valid) {
      errorMsg = v.message;
      break;
    }
  }

  if (errorMsg) {
    if (props.config.formProps.showErrorsAs === "notify") {
      emit("validationError", { field: key, message: errorMsg });
      formErrors[key] = "";
    } else {
      formErrors[key] = errorMsg;
    }
    return false;
  } else {
    formErrors[key] = "";
    return true;
  }
}

// ۶. validateAll با شرایط showIf
function validateAll(): boolean {
  let allValid = true;

  if (allSections.length) {
    allSections.forEach((section) => {
      (section.fields || []).forEach((field) => {
        if (!field.showIf || field.showIf(formValues)) {
          if (!runValidation(field.key)) {
            allValid = false;
            console.log(`Validation failed for field: ${field.key}`);
          }
        }
      });
    });
  } else {
    allFields.forEach((field) => {
      if (!field.showIf || field.showIf(formValues)) {
        if (!runValidation(field.key)) {
          allValid = false;
        }
      }
    });
  }

  return allValid;
}

// ۷. فوکوس روی اولین فیلد خطادار
function focusFirstError() {
  nextTick(() => {
    const combinedFields: FieldConfig[] = allSections.length
      ? allSections.flatMap((s) => s.fields || [])
      : allFields;
    const firstErrorKey = combinedFields.find((f) => formErrors[f.key])?.key;
    if (firstErrorKey) {
      const el = document.querySelector(
        `[name="${firstErrorKey}"]`
      ) as HTMLElement;
      if (el) el.focus();
    }
  });
}

// ۸. onSubmit (پاک‌کردن Auto-Save و ارسال نهایی)
async function onSubmit() {
  formLevelError.value = "";
  if (!validateAll()) {
    focusFirstError();
    return;
  }
  emit("submitForm", JSON.parse(JSON.stringify(formValues)));
}

// ۹. Props مشترک برای همهٔ فیلدها
function commonProps(field: FieldConfig) {
  return {
    label: field.label || "",
    placeholder: field.placeholder || "",
    disabled: props.config.formProps.disabledAll || field.disabled || false,
    errorMessage: formErrors[field.key] || "",
    name: field.key,
    required: field.validators?.some((v) => v.type === "required") || false,
    tooltip: field.tooltip || "",
    icon: field.icon || "",
  };
}

// ۱۰. buildFieldProps برای پراپ‌های اختصاصی
function buildFieldProps(field: FieldConfig) {
  const shared = commonProps(field);

  switch (field.type) {
    case "text":
    case "email":
    case "number":
    case "password":
    case "textarea":
      return {
        ...shared,
        type: field.type,
        prefix: field.prefix || "",
        suffix: field.suffix || "",
        passwordOptions: field.passwordOptions || false,
        labelPosition: resolveResponsive(field.labelPosition, "right"),
        ...(field.mask
          ? {
              maskOptions:
                typeof field.mask === "string"
                  ? predefinedMasks[field.mask]
                  : field.mask,
            }
          : {}),
      };

    case "date":
    case "time":
    case "datetime":
      return {
        ...shared,
        type: field.type, // date | time | datetime
        inputFormat: field.inputFormat || "YYYY/MM/DD", // فرمت خروجی مدل
        displayFormat: field.displayFormat || field.inputFormat || "YYYY/MM/DD",
        clearable: field.clearable || false,
        single: field.single !== false, // default true
        range: field.range === true, // اگر در کانفیگ بذاری
        calendarType: field.calendarType || "gregorian", // gregorian | persian
        labelPosition: resolveResponsive(field.labelPosition, "right"),
      };

    case "select":
      return {
        ...shared,
        items: field.items || [],
        multiple: field.multiple || false,
        searchable: field.searchable || false,
        clearable: field.clearableSelect || false,
        labelField: field.labelField || "label",
        valueField: field.valueField || "value",
        displayField: field.displayField || "",
        placeholder: field.placeholder || "",
        emptyMessage: field.emptyMessage || "گزینه‌ای موجود نیست ",
        labelPosition: resolveResponsive(field.labelPosition, "right"),
      };
    case "checkboxGroup":
      return {
        ...shared,
        options: field.options || [],
        groupLabel: field.groupLabel || "",
        direction: resolveResponsive(field.direction, "vertical"),
        disabled: props.config.formProps.disabledAll || false,
        required: field.validators?.some((v) => v.type === "required") || false,
        labelPosition: resolveResponsive(field.labelPosition, "right"),
      };

    case "radioGroup":
      return {
        ...shared,
        options: field.options || [],
        groupLabel: field.groupLabel || "",
        direction: resolveResponsive(field.direction, "vertical"),
        disabled: props.config.formProps.disabledAll || false,
        required: field.validators?.some((v) => v.type === "required") || false,
        labelPosition: resolveResponsive(field.labelPosition, "right"),
      };

    case "toggle":
      return {
        ...shared,
        size: field.size || "md",
        onColor: field.onColor || "bg-primary-100",
        offColor: field.offColor || "bg-gray-300",
        labelPosition: resolveResponsive(field.labelPosition, "right"),
      };

    case "file":
      return {
        ...shared,
        isImageUploader: field.isImageUploader === true,

        // مشترک
        accept: field.accept || "",
        multiple: field.multipleFile || false,
        maxFiles: field.maxFiles || 1,
        maxSize: field.maxSize || Infinity,

        // مخصوص ImageUploader
        aspectRatio: field.aspectRatio || "1/1",
        watermark: field.watermark || false,
        watermarkImage: field.watermarkImage || "",
        watermarkText: field.watermarkText || "",
        showInfo: field.showInfo !== false,
        infoText: field.infoText || "فرمت‌های مجاز: WebP, JPEG, PNG, GIF",
        sizeClass: field.sizeClass || "w-[200px]",

        // ✅ تصاویر اولیه برای حالت ویرایش
        initialImages: initialFileUrls[field.key] || [],
      };

    case "richtext":
      return {
        ...shared,
        image: field.image ?? true,
        labelPosition: resolveResponsive(field.labelPosition, "right"),
      };
    case "tags":
      return {
        ...shared,
        maxItems: field.maxItems ?? 50,
        minItems: field.minItems ?? 0,
      };
    default:
      return shared;
  }
}

// ۱۱. Mapping type → Component
function getComponentByType(type: string) {
  switch (type) {
    case "text":
    case "email":
    case "number":
    case "password":
    case "textarea":
    case "date":
    case "time":
    case "datetime":
      return InputField;
    case "select":
      return DropDown;
    case "checkboxGroup":
      return CheckBoxGroup;
    case "radioGroup":
      return RadioGroup;
    case "toggle":
      return ToggleSwitch;
    case "file":
      return FileField; // خارجی
    case "richtext":
      return RichTextField; // خارجی
    case "tags":
      return TagsField; // خارجی
    default:
      return InputField;
  }
}

// ۱۲. کلاس‌های Grid براساس columns
const gridClass = computed(() => {
  const cols = resolveResponsive(props.config.formProps.columns, 1);
  if (cols === 3) return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";
  if (cols === 2) return "grid grid-cols-1 md:grid-cols-2 gap-4";
  return "grid grid-cols-1 gap-4";
});

// ۱۳. مدیریت باز/بسته کردن سکشن‌ها
function toggleSection(index: number) {
  if (allSections[index]?.collapsible) {
    sectionOpenStates[index] = !sectionOpenStates[index];
  }
}

// متد Drop از FieldPalette
function handleDrop(e: DragEvent) {
  const type = e.dataTransfer?.getData("text/plain");
  if (type) {
    emit("addField", type);
  }
}

// متد انتخاب فیلد جهت PropertiesPanel
function selectField(key: string) {
  emit("selectField", key);
}
</script>

<style scoped>
.form-builder {
  /* در صورت نیاز استایل اضافه کنید */
  direction: rtl; /* راست‌چین */
}
</style>
