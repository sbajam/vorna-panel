<template>
  <div class="form-builder w-full">
    <!-- عنوان فرم و آیکون ذخیره دستی -->
    <div class="flex items-center justify-between mb-4">
      <h2 v-if="config.formProps.title" class="text-2xl font-bold">
        {{ config.formProps.title }}
      </h2>
      <!-- آیکون کلیپبورد برای ذخیره دستی -->
      <div
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
    <div v-else>
      <div
        class="min-h-[400px] border-2 border-dashed border-gray-300 rounded p-4 relative"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        <!-- <form > -->
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
                    section._open ? 'chevron-down' : 'chevron-left'
                  }`"
                />
              </div>
            </div>
            <!-- محتوای بخش -->
            <Vue3SlideUpDown v-model="section._open">
              <div
                v-show="!section.collapsible || section._open"
                class="mt-2 px-2"
              >
                <div :class="gridClass">
                  <template v-for="field in section.fields" :key="field.key">
                    <div
                      v-if="!field.showIf || field.showIf(formValues)"
                      :class="`col-span-1 md:col-span-${resolveResponsive(
                        field.layout?.colSpan,
                        1
                      )}`"
                    >
                      <component
                        v-if="field.type !== 'array'"
                        :is="getComponentByType(field.type)"
                        v-model="formValues[field.key]"
                        v-bind="buildFieldProps(field)"
                        @update:modelValue="() => runValidation(field.key)"
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
                :class="`col-span-1 md:col-span-${resolveResponsive(
                  field.layout?.colSpan,
                  1
                )}`"
              >
                <component
                  v-if="field.type !== 'array'"
                  :is="getComponentByType(field.type)"
                  v-model="formValues[field.key]"
                  v-bind="buildFieldProps(field)"
                  @update:modelValue="() => runValidation(field.key)"
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
          type="submit"
        >
          {{ config.submitButton.text }}
        </Button>
      </div>
      <!-- </form> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from "vue";

import InputField from "./InputField.vue";
import DropDown from "./DropDown.vue";
import CheckBoxGroup from "./CheckBoxGroup.vue";
import RadioGroup from "./RadioGroup.vue";
import ToggleSwitch from "./ToggleSwitch.vue";
import FileUploader from "./FileUploader.vue";
import RichTextEditor from "./Editor.vue";
import Button from "./Button.vue";
import Spinner from "./Spinner.vue";
import FieldArray from "./FieldArray.vue";
import { Vue3SlideUpDown } from "vue3-slide-up-down";

// IndexedDB helper
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

// TypeScript Interfaces
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
    pending?: boolean;
  };
}

const props = defineProps<{
  config: FormConfig;
  initialValues?: Record<string, any>;
}>();

const emit = defineEmits<{
  (e: "submitForm", values: Record<string, any>): void;
  (e: "validationError", payload: { field: string; message: string }): void;
  (e: "addField", type: string): void;
}>();

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

// مقداردهی اولیه برای هر فیلد
allSections.forEach((section) => {
  section._open = true;
  (section.fields || []).forEach((field) => {
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
      case "required":
        if (
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        )
          valid = false;
        break;
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
  console.log(
    "Form submitted with values:",
    JSON.parse(JSON.stringify(formValues))
  );
  formLevelError.value = "";
  if (!validateAll()) {
    focusFirstError();
    console.log("Form validation failed, focusing first error...");
    return;
  }
  console.log("Form is valid, proceeding with submission...");
  // پس از ارسال فرم، اگر می‌خواهید دادهٔ ذخیره‌شده را پاک کنید:
  //   if (props.config.formProps.autoSaveKey) {
  //     try {
  //       await idbSet(props.config.formProps.autoSaveKey!, null);
  //     } catch {
  //       // نادیده بگیر
  //       console.error("Failed to clear auto-save data.");
  //     }
  //   }
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
        type: field.type,
        inputFormat: field.inputFormat || "",
        displayFormat: field.displayFormat || "",
        clearable: field.clearable || false,
        single: field.single ?? true,
        calendarType: field.calendarType || "gregorian",
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
        onColor: field.onColor || "blue-500",
        offColor: field.offColor || "gray-300",
        labelPosition: resolveResponsive(field.labelPosition, "right"),
      };

    case "file":
      return {
        ...shared,
        files: formValues[field.key],
        accept: field.accept || "",
        multiple: field.multipleFile || false,
        maxFiles: field.maxFiles || 1,
        maxSize: field.maxSize || Infinity,
        isImageUploader: field.isImageUploader !== false,
        watermark: field.watermark || false,
        watermarkImage: field.watermarkImage || "",
        uploadUrl: field.uploadUrl || null,
      };

    case "richtext":
      return {
        ...shared,
        image: field.image ?? true,
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
      return FileUploader;
    case "richtext":
      return RichTextEditor;
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
  //   const section = allSections[index
  if (allSections[index]?.collapsible) {
    allSections[index]._open = !allSections[index]._open;
  }
}
function handleDrop(e: DragEvent) {
  const type = e.dataTransfer?.getData("text/plain");
  if (type) {
    emit("addField", type);
  }
}
</script>

<style scoped>
.form-builder {
  /* در صورت نیاز استایل اضافه کنید */
}
</style>
