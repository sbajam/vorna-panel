<template>
  <div>
    <h3 class="text-lg font-medium mb-4">Properties Panel</h3>
    <div v-if="fieldCopy" class="space-y-6">
      <!-- Label -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Label</label>
        <input
          type="text"
          v-model="localField.label"
          @input="emitUpdate"
          class="w-full border rounded px-2 py-1"
        />
      </div>

      <!-- Placeholder (برای برخی انواع) -->
      <div v-if="supportsPlaceholder(localField.type)">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Placeholder
        </label>
        <input
          type="text"
          v-model="localField.placeholder"
          @input="emitUpdate"
          class="w-full border rounded px-2 py-1"
        />
      </div>

      <!-- Required -->
      <div class="flex items-center">
        <input
          type="checkbox"
          id="required"
          v-model="localField.required"
          @change="onRequiredChange"
          class="mr-2"
        />
        <label for="required" class="text-sm font-medium text-gray-700">
          Required
        </label>
      </div>

      <!-- Validators ساده (مثلاً minLength و maxLength) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Validators
        </label>
        <div class="space-y-2">
          <!-- اگر required تیک دارد، یک آیتم read-only نشان بده -->
          <div v-if="localField.required" class="text-green-600 text-sm">
            – Required فعال است
          </div>
          <!-- minLength -->
          <div class="flex items-center space-x-2">
            <input
              type="checkbox"
              id="minLengthCb"
              v-model="localValidators.minLength.enabled"
              @change="emitUpdateValidators"
            />
            <label for="minLengthCb" class="text-sm">minLength</label>
            <input
              type="number"
              min="0"
              v-model.number="localValidators.minLength.value"
              @input="emitUpdateValidators"
              :disabled="!localValidators.minLength.enabled"
              class="w-16 border rounded px-1 py-0.5"
            />
          </div>
          <!-- maxLength -->
          <div class="flex items-center space-x-2">
            <input
              type="checkbox"
              id="maxLengthCb"
              v-model="localValidators.maxLength.enabled"
              @change="emitUpdateValidators"
            />
            <label for="maxLengthCb" class="text-sm">maxLength</label>
            <input
              type="number"
              min="0"
              v-model.number="localValidators.maxLength.value"
              @input="emitUpdateValidators"
              :disabled="!localValidators.maxLength.enabled"
              class="w-16 border rounded px-1 py-0.5"
            />
          </div>
          <!-- email (فقط برای نوع email نمایش بده) -->
          <div v-if="localField.type === 'email'" class="flex items-center">
            <input
              type="checkbox"
              id="emailCb"
              v-model="localValidators.email.enabled"
              @change="emitUpdateValidators"
            />
            <label for="emailCb" class="text-sm">Email Validation</label>
          </div>
        </div>
      </div>

      <!-- Layout colSpan (Responsive) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Layout: colSpan
        </label>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-xs text-gray-600">Base</label>
            <input
              type="number"
              min="1"
              v-model.number="localLayout.base"
              @input="emitUpdateLayout"
              class="w-full border rounded px-1 py-0.5"
            />
          </div>
          <div>
            <label class="text-xs text-gray-600">MD</label>
            <input
              type="number"
              min="1"
              v-model.number="localLayout.md"
              @input="emitUpdateLayout"
              class="w-full border rounded px-1 py-0.5"
            />
          </div>
        </div>
      </div>

      <!-- Options برای select / checkboxGroup / radioGroup -->
      <div v-if="['select', 'checkboxGroup', 'radioGroup'].includes(localField.type)">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ localField.type === 'select' ? 'Items' : 'Options' }}
        </label>
        <div class="space-y-2">
          <div
            v-for="(opt, idx) in localFieldOptions"
            :key="idx"
            class="flex items-center space-x-2"
          >
            <input
              type="text"
              v-model="opt.label"
              @input="emitUpdateOptions"
              placeholder="Label"
              class="border rounded px-1 py-0.5 w-1/2"
            />
            <input
              type="text"
              v-model="opt.value"
              @input="emitUpdateOptions"
              placeholder="Value"
              class="border rounded px-1 py-0.5 w-1/2"
            />
            <button
              class="text-red-600"
              @click.prevent="removeOption(idx)"
            >
              حذف
            </button>
          </div>
          <button
            class="mt-2 px-2 py-1 bg-green-600 text-white text-sm rounded"
            @click.prevent="addOption"
          >
            + افزودن گزینه
          </button>
        </div>
      </div>

      <!-- Tooltip -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Tooltip
        </label>
        <input
          type="text"
          v-model="localField.tooltip"
          @input="emitUpdate"
          class="w-full border rounded px-2 py-1"
        />
      </div>

      <!-- Icon (فقط نام آیکون) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Icon</label>
        <input
          type="text"
          v-model="localField.icon"
          @input="emitUpdate"
          placeholder="مثلاً fa6-solid:user"
          class="w-full border rounded px-2 py-1"
        />
      </div>

      <!-- Disabled -->
      <div class="flex items-center">
        <input
          type="checkbox"
          id="disabled"
          v-model="localField.disabled"
          @change="emitUpdate"
          class="mr-2"
        />
        <label for="disabled" class="text-sm font-medium text-gray-700">
          Disabled
        </label>
      </div>

      <!-- نمایش شرطی (showIf) – در این نسخه اولیه فقط یک چک‌باکس که بگوید فعال باشد -->
      <div class="flex items-center">
        <input
          type="checkbox"
          id="showIfCb"
          v-model="localShowIf.enabled"
          @change="emitUpdateShowIf"
          class="mr-2"
        />
        <label for="showIfCb" class="text-sm font-medium text-gray-700">
          Conditional (showIf)
        </label>
      </div>

      <!-- اگر شرطی فعال است، فعلاً یک textarea برای نوشتن کد جاوااسکریپت بگذاریم -->
      <div v-if="localShowIf.enabled">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          JS Expression (مثلاً values.age &gt; 18)
        </label>
        <textarea
          v-model="localShowIf.script"
          @input="emitUpdateShowIf"
          rows="3"
          class="w-full border rounded px-2 py-1"
        ></textarea>
      </div>

      <!-- دکمهٔ حذف فیلد -->
      <div class="pt-4 border-t">
        <button
          class="w-full text-red-600 border border-red-600 rounded px-3 py-1 hover:bg-red-50"
          @click="confirmDelete"
        >
          Delete Field
        </button>
      </div>
    </div>
    <div v-else class="text-gray-500">هیچ فیلدی انتخاب نشده.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, defineEmits, defineProps } from 'vue'

const emits = defineEmits<{
  (e: 'updateField', field: any): void
  (e: 'deleteField', key: string): void
}>()

const props = defineProps<{
  field: any
}>()

// کپی محلی از فیلد اصلی
const localField = ref({ ...props.field })

// یک ساختار جداگانه برای Validators
const localValidators = ref({
  minLength: { enabled: false, value: 0 },
  maxLength: { enabled: false, value: 0 },
  email: { enabled: false },
})

// بخش مربوط به showIf
const localShowIf = ref<{
  enabled: boolean
  script: string
}>({
  enabled: !!props.field.showIf,
  script: props.field.showIf
    ? props.field.showIf.toString().replace(/^.*\{([\s\S]*)\}$/, '$1')
    : '',
})

// بخش layout.colSpan
const localLayout = ref<{ base: number; md: number }>({
  base: props.field.layout?.colSpan?.base ?? 1,
  md: props.field.layout?.colSpan?.md ?? 1,
})

// بخش options برای select / checkboxGroup / radioGroup
const localFieldOptions = ref<Array<{ label: string; value: any }>>(
  // clone عمیق از props.field.items یا props.field.options
  props.field.type === 'select'
    ? JSON.parse(JSON.stringify(props.field.items || []))
    : JSON.parse(JSON.stringify(props.field.options || []))
)

// هر بار props.field از بیرون آپدیت شد، localField را sync می‌کنیم:
watch(
  () => props.field,
  (newF) => {
    localField.value = { ...newF }
    // مقداردهی مجدد قسمت‌های جزئی
    localLayout.value = {
      base: newF.layout?.colSpan?.base ?? 1,
      md: newF.layout?.colSpan?.md ?? 1,
    }
    localShowIf.value = {
      enabled: !!newF.showIf,
      script: newF.showIf
        ? newF.showIf.toString().replace(/^.*\{([\s\S]*)\}$/, '$1')
        : '',
    }
    localFieldOptions.value = props.field.type === 'select'
      ? JSON.parse(JSON.stringify(newF.items || []))
      : JSON.parse(JSON.stringify(newF.options || []))
    // اعتبارسنجی‌ها
    localValidators.value.minLength.enabled = !!newF.validators?.find(
      (v: any) => v.type === 'minLength'
    )
    localValidators.value.minLength.value =
      localValidators.value.minLength.enabled
        ? newF.validators!.find((v: any) => v.type === 'minLength')!.value
        : 0
    localValidators.value.maxLength.enabled = !!newF.validators?.find(
      (v: any) => v.type === 'maxLength'
    )
    localValidators.value.maxLength.value =
      localValidators.value.maxLength.enabled
        ? newF.validators!.find((v: any) => v.type === 'maxLength')!.value
        : 0
    localValidators.value.email.enabled = !!newF.validators?.find(
      (v: any) => v.type === 'email'
    )
  }
)

// تابع کمکی برای تشخیص اینکه فیلد placeholder نیاز دارد یا نه
function supportsPlaceholder(type: string) {
  return [
    'text',
    'email',
    'number',
    'password',
    'textarea',
    'date',
  ].includes(type)
}

// هر بار هر یک از قسمت‌ها تغییر کرد، emit کنیم:
function emitUpdate() {
  const updated = { ...localField.value }
  emits('updateField', updated)
}

// زمانی که required تغییر کرد، باید validator مربوطه را اضافه/حذف کنیم
function onRequiredChange() {
  if (localField.value.required) {
    // اضافه کردن validator required
    localField.value.validators = localField.value.validators || []
    if (!localField.value.validators.find((v: any) => v.type === 'required')) {
      localField.value.validators.push({
        type: 'required',
        message: 'این فیلد اجباری است',
      })
    }
  } else {
    // حذف validator required
    localField.value.validators = (localField.value.validators || []).filter(
      (v: any) => v.type !== 'required'
    )
  }
  emitUpdate()
}

// به‌روزرسانی Validatorها
function emitUpdateValidators() {
  const vList: any[] = []
  if (localField.value.required) {
    vList.push({ type: 'required', message: 'این فیلد اجباری است' })
  }
  if (localValidators.value.minLength.enabled) {
    vList.push({
      type: 'minLength',
      value: localValidators.value.minLength.value,
      message: `حداقل ${localValidators.value.minLength.value} کاراکتر`,
    })
  }
  if (localValidators.value.maxLength.enabled) {
    vList.push({
      type: 'maxLength',
      value: localValidators.value.maxLength.value,
      message: `حداکثر ${localValidators.value.maxLength.value} کاراکتر`,
    })
  }
  if (localValidators.value.email.enabled) {
    vList.push({
      type: 'email',
      message: 'فرمت ایمیل صحیح نیست',
    })
  }
  localField.value.validators = vList
  emitUpdate()
}

// به‌روزرسانی layout.colSpan
function emitUpdateLayout() {
  localField.value.layout = {
    colSpan: {
      base: localLayout.value.base,
      md: localLayout.value.md,
    },
  }
  emitUpdate()
}

// افزودن/حذف option
function addOption() {
  localFieldOptions.value.push({ label: '', value: '' })
}
function removeOption(idx: number) {
  localFieldOptions.value.splice(idx, 1)
  emitUpdateOptions()
}
function emitUpdateOptions() {
  if (localField.value.type === 'select') {
    localField.value.items = JSON.parse(
      JSON.stringify(localFieldOptions.value)
    )
  } else {
    localField.value.options = JSON.parse(
      JSON.stringify(localFieldOptions.value)
    )
  }
  emitUpdate()
}

// به‌روزرسانی showIf
function emitUpdateShowIf() {
  if (localShowIf.value.enabled) {
    // تبدیل JS script به یک تابع واقعی
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function(
        'values',
        `return ${localShowIf.value.script}`
      ) as (values: Record<string, any>) => boolean
      localField.value.showIf = fn
    } catch {
      localField.value.showIf = undefined
    }
  } else {
    localField.value.showIf = undefined
  }
  emitUpdate()
}

// حذف فیلد
function confirmDelete() {
  if (window.confirm('آیا مطمئن هستید که می‌خواهید این فیلد را حذف کنید؟')) {
    emits('deleteField', localField.value.key)
  }
}
</script>

<style scoped>
/* استایل اختصاصی شما */
</style>
