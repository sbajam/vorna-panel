<template>
  <div class="field-array space-y-4">
    <!-- عنوان آرایه (اختیاری) -->
    <label v-if="label" class="block text-lg font-semibold mb-2">
      {{ label }}  <!-- اگر فقط یک آیتم باشد و کمتر از حداقل، می‌توان پیغام داد یا دکمه را غیرفعال کرد -->
      <div :class="{'text-red-600':localItems.length<minItems}" v-if="localItems.length <= minItems" class="text-sm text-gray-500 mb-2">
        حداقل {{ minItems }} مورد لازم است
      </div>
    </label>

    <!-- لیست آیتم‌های آرایه -->
    <div v-for="(item, idx) in localItems" :key="idx" class="border rounded-lg p-4 relative">
      <!-- دکمهٔ حذف هر آیتم -->
       
      <button
        v-if="!disabled"
        @click="removeItem(idx)"
        type="button"
        class="absolute top-2 right-2 text-red-600 hover:text-red-800"
        aria-label="حذف این مورد"
      >
        <Icon name="fa6-solid:trash-can" />
      </button>

     

      <!-- رندر فیلدهای درون هر آیتم در یک شبکه -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <template v-for="field in itemFields" :key="field.key">
          <component
            :is="getComponentByType(field.type)"
            v-model="item[field.key]"
            v-bind="{
              ...commonProps(field),
              name: `${field.key}_${idx}`,
              // Props اختصاصی type:
              ...(field.mask
                ? { maskOptions: typeof field.mask === 'string' ? predefinedMasks[field.mask] : field.mask }
                : {}),
              ...(field.type === 'text' || field.type === 'email' || field.type === 'number' || field.type === 'password' || field.type === 'textarea'
                ? {
                    type: field.type,
                    placeholder: field.placeholder || '',
                    labelPosition: field.labelPosition || 'right',
                  }
                : {}),
              ...(field.type === 'toggle'
                ? { size: field.size || 'md', onColor: field.onColor || 'blue-500', offColor: field.offColor || 'gray-300', labelPosition: field.labelPosition || 'right' }
                : {}),
              ...(field.type === 'select'
                ? {
                    items: field.items || [],
                    multiple: field.multiple || false,
                    searchable: field.searchable || false,
                    clearable: field.clearableSelect || false,
                    labelField: field.labelField || 'label',
                    valueField: field.valueField || 'value',
                    displayField: field.displayField || '',
                    placeholder: field.placeholder || '',
                  }
                : {}),
              ...(field.type === 'file'
                ? {
                    files: item[field.key],
                    accept: field.accept || '',
                    multiple: field.multipleFile || false,
                    maxFiles: field.maxFiles || 1,
                    maxSize: field.maxSize || Infinity,
                    isImageUploader: field.isImageUploader !== false,
                    watermark: field.watermark || false,
                    watermarkImage: field.watermarkImage || '',
                    uploadUrl: field.uploadUrl || null,
                  }
                : {}),
            }"
            @update:modelValue="() => validateItemField(idx, field)"
          />
          
        </template>
      </div>
    </div>

    <!-- دکمهٔ افزودن آیتم جدید -->
    <button
      v-if="!disabled && localItems.length < maxItems"
      @click.prevent="addItem"
      type="button"
      class="inline-flex items-center px-4 py-2 bg-secondary-100 text-white rounded hover:bg-secondary-200 transition"
    >
      <Icon name="fa6-solid:plus" class="ml-1" /> افزودن
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'
import InputField from '../InputField.vue'
import DropDown from '../DropDown.vue'
import CheckBoxGroup from '../CheckBoxGroup.vue'
import RadioGroup from '../RadioGroup.vue'
import ToggleSwitch from '../ToggleSwitch.vue'
import FileUploader from '../FileUploader.vue'
import RichTextEditor from '../Editor.vue'

interface ValidatorConfig {
  type: string
  value?: any
  field?: string
  pattern?: string
  message: string
  validator?: (val: any, all: Record<string, any>) => boolean
}

interface ResponsiveProp<T> {
  base?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
}

interface FieldConfig {
  key: string
  type: string
  label?: string
  labelPosition?: ResponsiveProp<'top' | 'right'>
  placeholder?: string
  validators?: ValidatorConfig[]
  mask?: any | string
  prefix?: string
  suffix?: string
  size?: 'sm' | 'md' | 'lg'
  onColor?: string
  offColor?: string
  items?: Array<{ label: string; value: any }>
  multiple?: boolean
  searchable?: boolean
  clearableSelect?: boolean
  labelField?: string
  valueField?: string
  displayField?: string
  accept?: string
  multipleFile?: boolean
  maxFiles?: number
  maxSize?: number
  isImageUploader?: boolean
  watermark?: boolean
  watermarkImage?: string
  uploadUrl?: string
}

// ماسک‌های آماده
const predefinedMasks: Record<string, any> = {
  onlyDigits: { mask: Number, thousandsSeparator: '' },
  commaSeparated: { mask: Number, thousandsSeparator: ',' },
  mobile: { mask: '0000000000' },
  persianPhone: { mask: '0\\9999999999' },
}

const props = defineProps<{
  modelValue: Array<Record<string, any>>
  itemFields: FieldConfig[]
  minItems?: number
  maxItems?: number
  disabled?: boolean
  label?: string
  errorMessage?: string | Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: Array<Record<string, any>>): void
}>()

// تعداد حداقل/حداکثر آیتم‌ها
const minItems = props.minItems ?? 0
const maxItems = props.maxItems ?? Infinity
const disabled = props.disabled ?? false
const label = props.label ?? ''

// نگهداری نسخهٔ محلی آیتم‌ها
const localItems = ref<Array<Record<string, any>>>([])

// مقداردهی اولیه از prop
localItems.value = props.modelValue?.map(i => ({ ...i })) || []

// همگام‌سازی با تغییر prop از والد
watch(
  () => props.modelValue,
  (newVal) => {
    localItems.value = newVal?.map(i => ({ ...i })) || []
  },
  { deep: true }
)

// هر بار localItems تغییر کند، emit کنیم
watch(
  () => localItems.value,
  (newVal) => {
    // فقط آرایهٔ شیء خام را ارسال می‌کنیم
    emit('update:modelValue', newVal.map(i => ({ ...i })))
  },
  { deep: true }
)

// ساخت یک رشتهٔ خالی برای آیتم جدید بر اساس FieldConfig
function makeEmptyItem(): Record<string, any> {
  const obj: Record<string, any> = {}
  props.itemFields.forEach((f) => {
    switch (f.type) {
      case 'checkboxGroup':
        obj[f.key] = []
        break
      case 'toggle':
        obj[f.key] = false
        break
      case 'file':
        obj[f.key] = f.multipleFile ? [] : null
        break
      case 'array':
        obj[f.key] = []
        break
      default:
        obj[f.key] = ''
        break
    }
  })
  return obj
}

// افزودن آیتم جدید
function addItem() {
  if (localItems.value.length < maxItems) {
    localItems.value.push(makeEmptyItem())
  }
}

// حذف یک آیتم
function removeItem(index: number) {
//   if (localItems.value.length > minItems) {
    localItems.value.splice(index, 1)
//   }
//   else{
    // errorMessages.value = `حداقل ${minItems} مورد لازم است`
//   }
}

// اعتبارسنجی درون آرایه (در صورت نیاز)
function validateItemField(idx: number, field: FieldConfig) {
  // اینجا می‌توانید اعتبارسنجی هم روی هر آیتم پیاده کنید
  // مثلا اگر field.validators داشته باشد:
  //   const value = localItems.value[idx][field.key]
  //   // … بررسی کنید و شاید یک error state در هر آیتم ذخیره کنید
  // در این نمونه ساده، اعتبارسنجی افزونه‌ای را نگنجانده‌ایم.
}

// Props مشترک (label, placeholder, disabled, errorMessage, name, required, tooltip, icon)
function commonProps(field: FieldConfig) {
  return {
    label: field.label || '',
    placeholder: field.placeholder || '',
    disabled: disabled,
    errorMessage: '',
    name: field.key,
    required: field.validators?.some((v) => v.type === 'required') || false,
    tooltip: '',
    icon: '',
  }
}

// انتخاب کامپوننت بر اساس نوع فیلد
function getComponentByType(type: string) {
  switch (type) {
    case 'text':
    case 'email':
    case 'number':
    case 'password':
    case 'textarea':
    case 'date':
    case 'time':
    case 'datetime':
      return InputField
    case 'select':
      return DropDown
    case 'checkboxGroup':
      return CheckBoxGroup
    case 'radioGroup':
      return RadioGroup
    case 'toggle':
      return ToggleSwitch
    case 'file':
      return FileUploader
    case 'richtext':
      return RichTextEditor
    case 'array':
      return {} // اگر درون آرایه بازهم آرایه نمی‌خواهیم پشتیبانی کنیم
    default:
      return InputField
  }
}
</script>

<style scoped>
.field-array {
  /* در صورت نیاز استایل‌های اضافی را اینجا اضافه کنید */
}
</style>
