<template>
  <div class="flex h-screen overflow-hidden">
    <!-- ستون چپ: PropertiesPanel یا SectionSettingsPanel یا FormSettingsPanel -->
    <transition name="slide-fade">
      <aside
        v-if="activeFieldKey !== null || sectionEditingIndex !== null || formSettingsOpen"
        class="w-1/4 bg-gray-100 border-r border-gray-300 p-4 overflow-auto"
      >
        <!-- PropertiesPanel وقتی فیلد فعال است -->
        <PropertiesPanel
          v-if="activeFieldKey !== null"
          :field="activeField"
          @updateField="onUpdateField"
          @deleteField="onDeleteField"
        />
        <!-- SectionSettingsPanel وقتی سکشن فعال است -->
        <SectionSettingsPanel
          v-else-if="sectionEditingIndex !== null"
          :section="config.sections[sectionEditingIndex]"
          :index="sectionEditingIndex"
          @updateSection="onUpdateSection"
          @deleteSection="onDeleteSection"
        />
        <!-- FormSettingsPanel وقتی تنظیمات فرم باز است -->
        <FormSettingsPanel
          v-else-if="formSettingsOpen"
          :initialProps="config.formProps"
          @updateFormProps="onUpdateFormProps"
        />
      </aside>
    </transition>

    <!-- ستون وسط: Preview زنده -->
    <main class="flex-1 bg-white p-4 overflow-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold">
          <span v-if="config.formProps.title">{{ config.formProps.title }}</span>
          <span v-else class="text-gray-400">Form Preview</span>
        </h2>
        <button
          v-if="!activeFieldKey && sectionEditingIndex === null && !formSettingsOpen"
          class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          @click="openFormSettings"
        >
          ⚙️ تنظیمات فرم
        </button>
      </div>

      <FormBuilder
        :config="config"
        :initialValues="formValues"
        @addField="onDropField"
        @submitForm="onSubmitForm"
        @validationError="onValidationError"
        class="border rounded shadow"
      />
    </main>

    <!-- ستون راست: FieldPalette و دکمهٔ افزودن سکشن -->
    <aside class="w-1/4 bg-gray-50 border-l border-gray-300 p-4 overflow-auto">
      <FieldPalette @startDrag="onStartDrag" />
      <div class="mt-6">
        <button
          class="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          @click="addNewSection"
        >
          + افزودن بخش جدید
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

import FieldPalette from '../components/FieldPalette.vue'
import PropertiesPanel from '../components/PropertiesPanel.vue'
import SectionSettingsPanel from '../components/SectionSettingsPanel.vue'
import FormSettingsPanel from '../components/FormSettingsPanel.vue'
import FormBuilder from '../components/FormBuilder.vue'

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
  placeholder?: string
  required?: boolean
  validators?: any[]
  layout?: { colSpan?: ResponsiveProp<number> }
  items?: Array<{ label: string; value: any }>
  options?: Array<{ label: string; value: any }>
  direction?: ResponsiveProp<'vertical' | 'horizontal'>
  showIf?: (values: Record<string, any>) => boolean
  tooltip?: string
  icon?: string
  disabled?: boolean
  multipleFile?: boolean
  itemFields?: FieldConfig[]
  minItems?: number
  maxItems?: number
}

interface SectionConfig {
  title: string
  collapsible?: boolean
  _open?: boolean
  fields: FieldConfig[]
}

interface FormConfig {
  formProps: {
    title?: string
    columns?: ResponsiveProp<number>
    disabledAll?: boolean
    loading?: boolean
    loadingMode?: 'skeleton' | 'spinner' | 'button'
    showErrorsAs?: 'inline' | 'notify'
    autoSaveKey?: string
  }
  sections: SectionConfig[]
  submitButton: {
    text: string
    variant?: string
    color?: string
    pending?: boolean
  }
}

const config = reactive<FormConfig>({
  formProps: {
    title: 'فرم تست',
    columns: { base: 1, md: 2 },
    disabledAll: false,
    loading: false,
    loadingMode: 'spinner',
    showErrorsAs: 'inline',
    autoSaveKey: '',
  },
  sections: [
    {
      title: 'بخش اول',
      collapsible: true,
      _open: true,
      fields: [],
    },
  ],
  submitButton: {
    text: 'ارسال نهایی',
    variant: 'solid',
    color: 'primary-100',
    pending: false,
  },
})

const formValues = reactive<Record<string, any>>({})
const allFields = computed(() =>
  config.sections.flatMap((section) => section.fields)
)

function initializeFormValue(field: FieldConfig) {
  if (field.type === 'checkboxGroup' || field.type === 'array') {
    return []
  }
  if (field.type === 'toggle') {
    return false
  }
  if (field.type === 'file') {
    return field.multipleFile ? [] : null
  }
  return ''
}

allFields.value.forEach((f) => {
  formValues[f.key] = initializeFormValue(f)
})

const activeFieldKey = ref<string | null>(null)
const sectionEditingIndex = ref<number | null>(null)
const formSettingsOpen = ref(false)

const activeField = computed(() => {
  if (!activeFieldKey.value) return null
  return allFields.value.find((f) => f.key === activeFieldKey.value) || null
})

function onStartDrag(type: string) {
  // در FieldPalette.vue دادهٔ type را در dataTransfer می‌گذاریم؛
  // اگر لازم باشد اینجا هم کاری انجام دهید.
}

function onDropField(type: string) {
  if (!type) return
  const key = `field_${Date.now()}_${Math.floor(Math.random() * 1000)}`
  const newField: FieldConfig = {
    key,
    type,
    label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    placeholder: '',
    required: false,
    layout: { colSpan: { base: 1, md: 1 } },
    items: type === 'select' ? [] : undefined,
    options:
      type === 'checkboxGroup' || type === 'radioGroup' ? [] : undefined,
    direction: { base: 'vertical' },
    showIf: undefined,
    tooltip: '',
    icon: '',
    disabled: false,
    multipleFile: false,
  }
  config.sections[0].fields.push(newField)
  formValues[newField.key] = initializeFormValue(newField)
  activeFieldKey.value = newField.key
}

function onUpdateField(updatedField: FieldConfig) {
  for (const section of config.sections) {
    const idx = section.fields.findIndex((f) => f.key === updatedField.key)
    if (idx !== -1) {
      section.fields[idx] = { ...updatedField }
      return
    }
  }
}

function onDeleteField(fieldKey: string) {
  for (const section of config.sections) {
    const idx = section.fields.findIndex((f) => f.key === fieldKey)
    if (idx !== -1) {
      section.fields.splice(idx, 1)
      delete formValues[fieldKey]
      if (activeFieldKey.value === fieldKey) activeFieldKey.value = null
      return
    }
  }
}

function openSectionSettings(index: number) {
  sectionEditingIndex.value = index
  activeFieldKey.value = null
  formSettingsOpen.value = false
}

function onUpdateSection(updated: SectionConfig) {
  if (sectionEditingIndex.value === null) return
  config.sections[sectionEditingIndex.value] = { ...updated }
}

function onDeleteSection(idx: number) {
  const keysToRemove = config.sections[idx].fields.map((f) => f.key)
  keysToRemove.forEach((k) => delete formValues[k])
  config.sections.splice(idx, 1)
  sectionEditingIndex.value = null
}

function openFormSettings() {
  activeFieldKey.value = null
  sectionEditingIndex.value = null
  formSettingsOpen.value = true
}

function onUpdateFormProps(updatedProps: Partial<typeof config.formProps>) {
  config.formProps = { ...config.formProps, ...updatedProps }
}

function addNewSection() {
  const newSection: SectionConfig = {
    title: 'سکشن جدید',
    collapsible: false,
    _open: true,
    fields: [],
  }
  config.sections.push(newSection)
  sectionEditingIndex.value = config.sections.length - 1
  activeFieldKey.value = null
  formSettingsOpen.value = false
}

function onSubmitForm(values: Record<string, any>) {
  console.log('فرم ارسال شد با مقادیر:', values)
}

function onValidationError(payload: { field: string; message: string }) {
  console.log('خطای اعتبارسنجی:', payload.field, payload.message)
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-fade-enter-active {
  transition: all 0.2s ease;
}
.slide-fade-leave-active {
  transition: all 0.2s ease;
}
.slide-fade-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}
.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
