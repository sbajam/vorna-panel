<template>
  <div class="flex h-screen overflow-hidden">
    <!-- ستون چپ: PropertiesPanel یا SectionSettingsPanel یا FormSettingsPanel -->
    <transition name="slide-fade">
      <aside
        v-if="
          activeFieldKey !== null ||
          sectionEditingIndex !== null ||
          formSettingsOpen
        "
        class="w-1/4 bg-gray-100 border-r border-gray-300 p-4 overflow-auto"
      >
        <!-- PropertiesPanel وقتی فیلد فعال است -->
        <PropertiesPanel
          v-if="activeFieldKey !== null"
          :field="activeField"
          :formValues="formValues"
          :formErrors="formErrors"
          :allFields="allFields"
          @updateField="onUpdateField"
          @renameField="onRenameField"
          @deleteField="onDeleteField"
          @closePanel="activeFieldKey = null"
        />

         <!-- SectionSettingsPanel وقتی سکشن فعال است -->
        <SectionSettingsPanel
          v-else-if="sectionEditingIndex !== null"
          :section="config.sections[sectionEditingIndex]"
          @updateSection="onUpdateSection"
          @deleteSection="onDeleteSection"
          @closePanel="closeAllPanels"
        />

        <!-- FormSettingsPanel وقتی تنظیمات فرم باز است -->
        <FormSettingsPanel
          v-else-if="formSettingsOpen"
          :formProps="config.formProps"
          @updateFormProps="onUpdateFormProps"
          @closePanel="closeAllPanels"
        />
      </aside>
    </transition>

    <!-- ستون وسط: Preview زنده -->
    <main class="flex-1 bg-white p-4 overflow-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold">
          <span v-if="config.formProps.title">{{
            config.formProps.title
          }}</span>
          <span v-else class="text-gray-400">Form Preview</span>
        </h2>
        <button
          v-if="
            !activeFieldKey && sectionEditingIndex === null && !formSettingsOpen
          "
          class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          @click="openFormSettings"
        >
          ⚙️ تنظیمات فرم
        </button>
      </div>

      <!-- ─── Canvas ساده (به جای <FormBuilder>) ─── -->
      <div
        class="min-h-[400px] border-2 border-dashed border-gray-300 rounded p-4 relative"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        <template v-if="config.sections && config.sections.length">
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
                      <div class="border rounded p-2 bg-gray-50 cursor-pointer">
                        {{ field.label || field.type }}
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </Vue3SlideUpDown>
          </div>
        </template>

        <!-- اگر بخش‌بندی نداریم -->
        <template v-else>
          <div class="text-gray-400 text-center py-8">
            هیچ سکشنی وجود ندارد. یک سکشن جدید اضافه کنید.
          </div>
        </template>
      </div>
      <!-- ──────────────────────────────────────── -->
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
import { ref, reactive, computed, watch } from "vue";

import FieldPalette from "../components/FieldPalette.vue";
import PropertiesPanel from "../components/PropertiesPanel.vue";
import SectionSettingsPanel from "../components/SectionSettingsPanel.vue";
import FormSettingsPanel from "../components/FormSettingsPanel.vue";


// -------------------------
// ۱. داده‌های پایه (config, formValues, activeFieldKey و غیره)
// -------------------------
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
  tooltip?: string
  icon?: string
  required?: boolean
  disabled?: boolean
  layout?: { colSpan?: ResponsiveProp<number> }
  showIf?: any
  // …و سایر props مربوط به هر نوع فیلد
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
    direction?: 'rtl' | 'ltr'
    validationMode?: 'onChange' | 'onBlur' | 'onSubmit'
    defaultValues?: Record<string, any>
  }
  sections: SectionConfig[]
  submitButton: {
    text: string
    variant?: string
    color?: string
    pending?: boolean
  }
}

// نمونهٔ ابتداییِ config (می‌تواند هر چیزی باشد)
const config = reactive<FormConfig>({
  formProps: {
    title: 'فرم نمونه',
    columns: { base: 1, md: 2 },
    disabledAll: false,
    loading: false,
    loadingMode: 'spinner',
    showErrorsAs: 'inline',
    autoSaveKey: '',
    direction: 'rtl',
    validationMode: 'onChange',
    defaultValues: {},
  },
  sections: [
    {
      title: 'بخش اول',
      collapsible: true,
      _open: true,
      fields: [
        // در ابتدا می‌توانید فیلدی تعریف کنید، یا خالی شروع کنید
        {
          key: 'name',
          type: 'text',
          label: 'Name',
          placeholder: 'Enter your name',
          required: true,
          layout: { colSpan: { base: 1, md: 1 } },
        },
      ],
    },
  ],
  submitButton: {
    text: 'ارسال',
    variant: 'solid',
    color: 'primary-100',
    pending: false,
  },
})

// ۲. formValues: نگهداریِ مقدار فعلی هر فیلد
const formValues = reactive<Record<string, any>>({})

// هنگام mount یا به محض اینکه فیلدها را داریم، مقدار اولیه می‌سازیم
// برای هر field در config.sections[*].fields[*]، یک کلید در formValues قرار می‌دهیم
config.sections.forEach((section) => {
  section.fields.forEach((f) => {
    // اگر مقدار پیش‌فرض در defaultValues باشد، از آن استفاده می‌کنیم
    if (config.formProps.defaultValues?.[f.key] != null) {
      formValues[f.key] = config.formProps.defaultValues[f.key]
    } else {
      // بر اساس نوعِ فیلد یک مقدار اولیه بسازیم
      switch (f.type) {
        case 'checkboxGroup':
        case 'array':
          formValues[f.key] = []
          break
        case 'toggle':
          formValues[f.key] = false
          break
        case 'file':
          formValues[f.key] = f.multipleFile ? [] : null
          break
        default:
          formValues[f.key] = ''
      }
    }
  })
})

// اگر بعدها فیلد جدید اضافه شد، یا حذف شد، باید این را هم در onUpdateField / onDeleteField بروزرسانی کنیم.

// ۳. formErrors: یک آبجکت reactive برای پیام‌های خطا (initially empty)
const formErrors = reactive<Record<string, string>>({})

// ابتدا برای هر فیلدِ فعلی، یک کلید می‌سازیم و مقدارش رشتهٔ خالی است
config.sections.forEach((section) => {
  section.fields.forEach((f) => {
    formErrors[f.key] = ''
  })
})

// اگر فیلدی بعداً حذف شود، باید delete formErrors[key] کنیم.
// اگر فیلدی بعداً rename شود، باید پیام خطای oldKey را به newKey منتقل کنیم.

// ۴. activeFieldKey: کلیدِ فیلدِ در حالِ ویرایش
const activeFieldKey = ref<string | null>(null)

// ۵. convenient computed: لیست همهٔ فیلدها (فقط آرایهٔ شفافِ FieldConfig)
const allFields = computed<FieldConfig[]>(() =>
  config.sections.flatMap((sec) => sec.fields)
)

// ۶. computed برای پیدا کردن FieldConfigِ فعال
const activeField = computed<FieldConfig | null>(() => {
  if (!activeFieldKey.value) return null
  for (const sec of config.sections) {
    const found = sec.fields.find((f) => f.key === activeFieldKey.value)
    if (found) return found
  }
  return null
})

// -------------------------
// ۷. onRenameField: وقتی PropertiesPanel emit کند { oldKey, newKey }
// -------------------------
function onRenameField(payload: { oldKey: string; newKey: string }) {
  const { oldKey, newKey } = payload

  // — گام ۱: مطمئن شویم that oldKey exists, and newKey is unique (PropertiesPanel قبلاً اعتبارسنجی کرد)
  // — گام ۲: انتقال formValues
  if (formValues[oldKey] !== undefined) {
    formValues[newKey] = formValues[oldKey]
    delete formValues[oldKey]
  }

  // — گام ۳: انتقال formErrors
  if (formErrors[oldKey] !== undefined) {
    formErrors[newKey] = formErrors[oldKey]
    delete formErrors[oldKey]
  }

  // — گام ۴: درون config.sections، key را تغییر بدهیم
  for (const section of config.sections) {
    const idx = section.fields.findIndex((f) => f.key === oldKey)
    if (idx !== -1) {
      section.fields[idx].key = newKey
      break
    }
  }

  // — گام ۵: اگر activeFieldKey روی oldKey بود، به newKey منتقلش کن
  if (activeFieldKey.value === oldKey) {
    activeFieldKey.value = newKey
  }
}

// -------------------------
// ۸. سایر توابع (نمونه) برای onUpdateField و onDeleteField
//    این‌ها لازم است تا when PropertiesPanel emit شود، ما config.sections, formValues, formErrors را بروزرسانی کنیم.
// -------------------------
function onUpdateField(updatedField: FieldConfig) {
  // فقط ویژگی‌های field را به‌روزرسانی می‌کنیم (جابه‌جایی کل آبجکت باعث از دست رفتن برخی پیوندها نمی‌شود)
  for (const section of config.sections) {
    const idx = section.fields.findIndex((f) => f.key === updatedField.key)
    if (idx !== -1) {
      section.fields[idx] = { ...updatedField }
      break
    }
  }
}

function onDeleteField(fieldKey: string) {
  // حذف فیلد از config.sections
  for (const section of config.sections) {
    const idx = section.fields.findIndex((f) => f.key === fieldKey)
    if (idx !== -1) {
      section.fields.splice(idx, 1)
      break
    }
  }
  // حذف از formValues و formErrors
  delete formValues[fieldKey]
  delete formErrors[fieldKey]

  // اگر پنل فعال روی این field بود، آن را ببند
  if (activeFieldKey.value === fieldKey) {
    activeFieldKey.value = null
  }
}

// -------------------------
// ۹. مثالِ نحوهٔ باز کردن PropertiesPanel (در Canvas)
//    فرض کنید هر div مربوط به یک فیلد چنین کدی دارد:
// -------------------------
function selectField(key: string) {
  activeFieldKey.value = key
}

// -------------------------
// ۱۰. اگر لازم است برای Section یا FormPanel هم handler بنویسید
//    ولی سؤال شما فقط دربارهٔ onRenameField و formErrors بود.
// -------------------------
///////////////////////////////////////////////////+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
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
  placeholder?: string;
  required?: boolean;
  validators?: any[];
  layout?: { colSpan?: ResponsiveProp<number> };
  items?: Array<{ label: string; value: any }>;
  options?: Array<{ label: string; value: any }>;
  direction?: ResponsiveProp<"vertical" | "horizontal">;
  // showIf?: (values: Record<string, any>) => boolean;
  tooltip?: string;
  icon?: string;
  disabled?: boolean;
  multipleFile?: boolean;
  itemFields?: FieldConfig[];
  minItems?: number;
  maxItems?: number;
}

interface SectionConfig {
  title: string;
  collapsible?: boolean;
  _open?: boolean;
  fields: FieldConfig[];
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
    direction?: "rtl" | "ltr";
    validationMode?: "onChange" | "onBlur" | "onSubmit";
    defaultValues?: Record<string, any>;
  };
  sections: SectionConfig[];
  submitButton: {
    text: string;
    variant?: string;
    color?: string;
    pending?: boolean;
  };
}



// متد برای دراپ فیلد از FieldPalette
function handleDrop(e: DragEvent) {
  const type = e.dataTransfer?.getData("text/plain");
  if (!type) return;
  const key = `field_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const newField: FieldConfig = {
    key,
    type,
    label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    placeholder: "",
    required: false,
    layout: { colSpan: { base: 1, md: 1 } },
    items: type === "select" ? [] : undefined,
    options: type === "checkboxGroup" || type === "radioGroup" ? [] : undefined,
    direction: { base: "vertical" },
    showIf: undefined,
    tooltip: "",
    icon: "",
    disabled: false,
    multipleFile: false,
  };
  config.sections[0].fields.push(newField);
  formValues[newField.key] = initializeFormValue(newField);
  activeFieldKey.value = newField.key;
}


function initializeFormValue(field: FieldConfig) {
  if (field.type === "checkboxGroup" || field.type === "array") {
    return [];
  }
  if (field.type === "toggle") {
    return false;
  }
  if (field.type === "file") {
    return field.multipleFile ? [] : null;
  }
  return "";
}

// برای هر فیلد، یک مقدار اولیه تنظیم کن
allFields.value.forEach((f) => {
  formValues[f.key] = initializeFormValue(f);
});

const sectionEditingIndex = ref<number | null>(null);
const formSettingsOpen = ref(false);


// اگر بعداً فیلد حذف شد و activeFieldKey دیگر وجود نداشت، آن را ریست کن
watch(
  () => allFields.value.map((f) => f.key),
  (keys) => {
    if (activeFieldKey.value && !keys.includes(activeFieldKey.value)) {
      activeFieldKey.value = null;
    }
  }
);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ۴. متدهای مورد نیاز در والد:

// وقتی PropertiesPanel یک فیلد را آپدیت می‌کند:
// function onUpdateField(updatedField: FieldConfig) {
//   // (همان کدی که از قبل داشتید)
// }

// وقتی PropertiesPanel بخواهد کلید (key) یک فیلد را تغییر دهد:
// function onRenameField(payload: { oldKey: string; newKey: string }) {
//   // حتماً باید در formValues و formErrors و در config.sections هم کلیدها را اصلاح کنید.
//   // به طور خلاصه:
//   // 1. مقدار قدیمی را از formValues و formErrors بردارید،
//   // 2. بخشِ مربوطه در config.sections را پیدا کنید و آن‌جا key را عوض کنید.
//   // ۳. اگر لازم است، سایر ارجاعات به آن کلید را هم اصلاح کنید.
// }

// وقتی PropertiesPanel بخواهد یک فیلد را حذف کند:
// function onDeleteField(fieldKey: string) {
//   // (کدی که از قبل داشتید)
// }

// وقتی SectionSettingsPanel می‌گوید بخش ویرایش شده:
// function onUpdateSection(updatedSection: SectionConfig) {
//   // اکنون به جای این‌که کل شیٔ config.sections[index] را تعویض کنید،
//   // شما همان شیٔ اولیه را shallow update کنید یا به کل جایگزین کنید (هر دو روش درست است)
//   config.sections[sectionEditingIndex] = { ...updatedSection };
// }

// وقتی SectionSettingsPanel می‌گوید بخش را حذف کن:
function onDeleteSection() {
  const idx = sectionEditingIndex.value!;
  // حذف مقادیر formValues مرتبط با فیلدهای آن بخش
  const keysToRemove = config.sections[idx].fields.map((f) => f.key);
  keysToRemove.forEach((k) => delete formValues[k]);
  // حذف خود بخش
  config.sections.splice(idx, 1);
  sectionEditingIndex.value = null;
}

// وقتی FormSettingsPanel درخواست می‌کند که formProps به‌روز شود:
function onUpdateFormProps(updated: Partial<typeof config.formProps>) {
  config.formProps = { ...config.formProps, ...updated };
}

// وقتی هرکدام از پنل‌ها می‌خواهند بسته شوند:
function closeAllPanels() {
  activeFieldKey.value = null;
  sectionEditingIndex.value = null;
  formSettingsOpen.value = false;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function openSectionSettings(index: number) {
  sectionEditingIndex.value = index;
  activeFieldKey.value = null;
  formSettingsOpen.value = false;
}

function onUpdateSection(updated: SectionConfig) {
  if (sectionEditingIndex.value === null) return;
  config.sections[sectionEditingIndex.value] = { ...updated };

}

// function onDeleteSection(idx: number) {
//   const keysToRemove = config.sections[idx].fields.map((f) => f.key);
//   keysToRemove.forEach((k) => delete formValues[k]);
//   config.sections.splice(idx, 1);
//   sectionEditingIndex.value = null;
// }

function openFormSettings() {
  activeFieldKey.value = null;
  sectionEditingIndex.value = null;
  formSettingsOpen.value = true;
}

// function onUpdateFormProps(updatedProps: Partial<typeof config.formProps>) {
//   config.formProps = { ...config.formProps, ...updatedProps };
// }

function addNewSection() {
  const newSection: SectionConfig = {
    title: "سکشن جدید",
    collapsible: false,
    _open: true,
    fields: [],
  };
  config.sections.push(newSection);
  sectionEditingIndex.value = config.sections.length - 1;
  activeFieldKey.value = null;
  formSettingsOpen.value = false;
}

function onSubmitForm(values: Record<string, any>) {
  console.log("فرم ارسال شد با مقادیر:", values);
}

function onValidationError(payload: { field: string; message: string }) {
  console.log("خطای اعتبارسنجی:", payload.field, payload.message);
}

const gridClass = computed(() => {
  const cols = config.formProps.columns?.md || 1;
  if (cols === 2) return "grid grid-cols-1 md:grid-cols-2 gap-4";
  return "grid grid-cols-1 gap-4";
});

function resolveResponsive<T>(
  prop: ResponsiveProp<T> | undefined,
  defaultValue: T
): T {
  if (!prop) return defaultValue;
  return prop.md || prop.base || defaultValue;
}

function toggleSection(sidx: number) {
  if (config.sections[sidx]?.collapsible) {
    config.sections[sidx]._open = !config.sections[sidx]._open;
  }
  openSectionSettings(sidx);
}


// -------------------------
// ۱. داده‌های پایه (config, formValues, activeFieldKey و غیره)
// -------------------------
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
  tooltip?: string
  icon?: string
  required?: boolean
  disabled?: boolean
  layout?: { colSpan?: ResponsiveProp<number> }
  showIf?: any
  // …و سایر props مربوط به هر نوع فیلد
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
    direction?: 'rtl' | 'ltr'
    validationMode?: 'onChange' | 'onBlur' | 'onSubmit'
    defaultValues?: Record<string, any>
  }
  sections: SectionConfig[]
  submitButton: {
    text: string
    variant?: string
    color?: string
    pending?: boolean
  }
}

// هنگام mount یا به محض اینکه فیلدها را داریم، مقدار اولیه می‌سازیم
// برای هر field در config.sections[*].fields[*]، یک کلید در formValues قرار می‌دهیم
config.sections.forEach((section) => {
  section.fields.forEach((f) => {
    // اگر مقدار پیش‌فرض در defaultValues باشد، از آن استفاده می‌کنیم
    if (config.formProps.defaultValues?.[f.key] != null) {
      formValues[f.key] = config.formProps.defaultValues[f.key]
    } else {
      // بر اساس نوعِ فیلد یک مقدار اولیه بسازیم
      switch (f.type) {
        case 'checkboxGroup':
        case 'array':
          formValues[f.key] = []
          break
        case 'toggle':
          formValues[f.key] = false
          break
        case 'file':
          formValues[f.key] = f.multipleFile ? [] : null
          break
        default:
          formValues[f.key] = ''
      }
    }
  })
})

// اگر بعدها فیلد جدید اضافه شد، یا حذف شد، باید این را هم در onUpdateField / onDeleteField بروزرسانی کنیم.

// ۳. formErrors: یک آبجکت reactive برای پیام‌های خطا (initially empty)

// ابتدا برای هر فیلدِ فعلی، یک کلید می‌سازیم و مقدارش رشتهٔ خالی است
config.sections.forEach((section) => {
  section.fields.forEach((f) => {
    formErrors[f.key] = ''
  })
})

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
