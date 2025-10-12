<template>
  <div class="field-array space-y-2 my-4">
    <label v-if="label" class="block text-lg font-semibold mb-2">
      {{ label }}
      <div
        v-if="items.length < minItems && minItems !== 0"
        :class="{ 'text-red-600': items.length < minItems }"
        class="text-sm text-gray-500 mb-2"
      >
        حداقل {{ minItems }} مورد لازم است
      </div>
    </label>
    <ul v-auto-animate>
      <li
        v-for="(item, idx) in items"
        :key="idx"
        class="border rounded-lg p-4 relative"
      >
        <button
          v-if="!disabled"
          @click="removeItem(idx)"
          type="button"
          class="absolute top-2 right-2 text-red-600 hover:text-red-800"
          aria-label="حذف این مورد"
        >
          <Icon name="fa6-solid:trash-can" />
        </button>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <template v-for="field in itemFields" :key="field.key">
            <component
              :is="getComponentByType(field.type)"
              :modelValue="item[field.key]"
              @update:modelValue="(val) => setItemField(idx, field.key, val)"
              v-bind="buildProps(field, idx)"
            />
          </template>
        </div>
      </li>
    </ul>
    <button
      v-if="!disabled && items.length < maxItems"
      @click.prevent="addItem"
      type="button"
      class="inline-flex items-center px-4 py-2 bg-secondary-100 text-white rounded hover:bg-secondary-200 transition"
    >
      <Icon name="fa6-solid:plus" class="ml-1" /> افزودن
    </button>
  </div>
</template>

<script setup lang="ts">

import { computed,defineEmits } from "vue";
import InputField from "../InputField.vue";
import DropDown from "../DropDown.vue";
import CheckBoxGroup from "../CheckBoxGroup.vue";
import RadioGroup from "../RadioGroup.vue";
import ToggleSwitch from "../ToggleSwitch.vue";
import FileUploader from "../FileUploader.vue";
import RichTextEditor from "../Editor.vue"; // دقت کن مسیر درست باشه

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
  mask?: any | string;
  prefix?: string;
  suffix?: string;
  size?: "sm" | "md" | "lg";
  onColor?: string;
  offColor?: string;
  items?: Array<{ label: string; value: any }>;
  multiple?: boolean;
  searchable?: boolean;
  clearableSelect?: boolean;
  labelField?: string;
  valueField?: string;
  displayField?: string;
  accept?: string;
  multipleFile?: boolean;
  maxFiles?: number;
  maxSize?: number;
  isImageUploader?: boolean;
  watermark?: boolean;
  watermarkImage?: string;
  uploadUrl?: string;
}

const props = defineProps<{
  modelValue: Array<Record<string, any>>;
  itemFields: FieldConfig[];
  minItems?: number;
  maxItems?: number;
  disabled?: boolean;
  label?: string;
  errorMessage?: string | Record<string, string>;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", val: Array<Record<string, any>>): void;
}>();

const minItems = props.minItems ?? 0;
const maxItems = props.maxItems ?? Infinity;
const disabled = props.disabled ?? false;
const label = props.label ?? "";

// کنترل‌شده: بدون state محلی و بدون watch عمیق
const items = computed({
  get: () => props.modelValue ?? [],
  set: (val: Array<Record<string, any>>) => emit("update:modelValue", val),
});

function makeEmptyItem(): Record<string, any> {
  const obj: Record<string, any> = {};
  props.itemFields.forEach((f) => {
    switch (f.type) {
      case "checkboxGroup":
        obj[f.key] = [];
        break;
      case "toggle":
        obj[f.key] = false;
        break;
      case "file":
        obj[f.key] = f.multipleFile ? [] : null;
        break;
      case "array":
        obj[f.key] = [];
        break;
      default:
        obj[f.key] = "";
        break;
    }
  });
  return obj;
}

function addItem() {
  if (items.value.length >= maxItems) return;
  items.value = [...items.value, makeEmptyItem()];
}

function removeItem(index: number) {
  if (items.value.length <= minItems) return;
  const next = items.value.slice();
  next.splice(index, 1);
  items.value = next;
}

function setItemField(idx: number, key: string, val: any) {
  // immutable update
  const next = items.value.slice();
  const nextItem = { ...next[idx], [key]: val };
  next[idx] = nextItem;
  items.value = next;
}

function commonProps(field: FieldConfig) {
  return {
    label: field.label || "",
    placeholder: field.placeholder || "",
    disabled: disabled,
    errorMessage: "",
    name: field.key,
    required: field.validators?.some((v) => v.type === "required") || false,
    tooltip: "",
    icon: "",
  };
}
function buildProps(field: FieldConfig, idx: number) {
  const base = commonProps(field);
  if (
    [
      "text",
      "email",
      "number",
      "password",
      "textarea",
      "date",
      "time",
      "datetime",
    ].includes(field.type)
  ) {
    return {
      ...base,
      type: field.type,
      placeholder: field.placeholder || "",
      labelPosition: field.labelPosition || "right",
    };
  }
  if (field.type === "toggle") {
    return {
      ...base,
      size: field.size || "md",
      onColor: field.onColor || "bg-secondary-100",
      offColor: field.offColor || "bg-gray-300",
      labelPosition: field.labelPosition || "right",
    };
  }
  if (field.type === "select") {
    return {
      ...base,
      items: field.items || [],
      multiple: field.multiple || false,
      searchable: field.searchable || false,
      clearable: field.clearableSelect || false,
      labelField: field.labelField || "label",
      valueField: field.valueField || "value",
      displayField: field.displayField || "",
      placeholder: field.placeholder || "",
    };
  }
  if (field.type === "file") {
    return {
      ...base,
      accept: field.accept || "",
      multiple: field.multipleFile || false,
      maxFiles: field.maxFiles || 1,
      maxSize: field.maxSize || Infinity,
      isImageUploader: field.isImageUploader !== false,
      watermark: field.watermark || false,
      watermarkImage: field.watermarkImage || "",
      uploadUrl: field.uploadUrl || null,
    };
  }
  return base;
}

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
</script>

<style scoped>
.field-array {
  /* optional */
}
</style>
