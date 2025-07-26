<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <PreviewP
      v-if="showPreview"
      :show="showPreview"
      :config="config"
      :formValues="formValues"
      @validationError="onValidationError"
      @close_popup="togglePreview"
      @submitForm="onSubmitForm"
    />
    <!-- ====== HEADER با دکمه‌های Settings / Preview / Generate / Import ====== -->
    <header
      class="flex items-center justify-between bg-white border-b px-4 py-2 shadow-md"
    >
      <h1 class="text-2xl font-semibold text-gray-800">طراح فرم</h1>
      <div class="flex items-center space-x-2">
        <!-- دکمهٔ تنظیمات فرم -->
        <button
          class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          @click="openFormSettings"
          :disabled="showPreview"
        >
          ⚙️ تنظیمات فرم
        </button>

        <!-- دکمهٔ پیش‌نمایش -->
        <button
          class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          @click="togglePreview"
        >
          👁 پیش‌نمایش
        </button>

        <!-- دکمهٔ تولید کد JSON -->
        <button
          class="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          @click="copyFullPage"
        >
          📄 دریافت کد
        </button>

        <!-- دکمهٔ بارگذاری از کد -->
        <button
          class="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          @click="importConfigFromCode"
          :disabled="showPreview"
        >
          🔄 بارگذاری از کد
        </button>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <!-- ========== ستون چپ: PropertiesPanel یا SectionSettingsPanel یا FormSettingsPanel ========== -->
      <transition name="slide-fade">
        <aside
          v-if="
            activeFieldKey !== null ||
            sectionEditingIndex !== null ||
            formSettingsOpen
          "
          class="w-1/4 bg-gray-100 border-r border-gray-300 p-4 overflow-auto"
        >
          <!-- ===== PropertiesPanel ===== -->
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

          <!-- ===== SectionSettingsPanel ===== -->
          <SectionSettingsPanel
            v-else-if="sectionEditingIndex !== null"
            :section="config.sections[sectionEditingIndex]"
            :submitButton="config.submitButton"
            @updateSection="onUpdateSection"
            @deleteSection="onDeleteSection"
            @updateSubmitButton="onUpdateSubmitButton"
            @closePanel="closeAllPanels"
          />

          <!-- ===== FormSettingsPanel ===== -->
          <FormSettingsPanel
            v-else-if="formSettingsOpen"
            :formProps="config.formProps"
            @updateFormProps="onUpdateFormProps"
            @closePanel="closeAllPanels"
          />
        </aside>
      </transition>

      <!-- ========== ستون وسط: CANVAS / Draggable Sections & Fields ========== -->
      <main class="flex-1 bg-white p-4 overflow-auto relative">
        <!-- اگر پیش‌نمایش فعال باشد -->
        <div v-if="showPreview" class="h-full">
          <FormBuilder
            :config="config"
            @submitForm="onSubmitForm"
            @validationError="onValidationError"
          />
          <button
            class="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            @click="togglePreview"
          >
            ✕ بستن پیش‌نمایش
          </button>
          <div class="absolute bottom-4 left-4 text-sm text-gray-500">
            <p class="mb-1">
              برای تعامل با فرم پیش‌نمایش، می‌توانید روی فیلدها کلیک کنید.
            </p>
          </div>
          <div class="absolute inset-0 bg-white bg-opacity-90"></div>
        </div>

        <!-- اگر پیش‌نمایش فعال نیست: نمایش Canvas طراحی ===== -->
        <div v-else class="flex flex-col h-full">
          <div class="mb-4 text-gray-600">
            <p>برای انتخاب سکشن، روی کارت آن کلیک کنید (رینگ سبز می‌شود).</p>
            <p>
              بعد از انتخاب سکشن، روی یکی از انواع فیلد در Palette کلیک کنید تا
              اضافه شود.
            </p>
            <p>
              برای جابه‌جایی سکشن‌ها یا فیلدها، روی آیکون «≡» کلیک و درگ کنید.
            </p>
          </div>

          <!-- Draggable سکشن‌ها -->
          <draggable
            v-model="config.sections"
            handle=".section-handle"
            item-key="title"
            class="space-y-4 relative z-10"
          >
            <template #item="{ element: section, index: sidx }">
              <div
                class="border border-gray-300 rounded bg-gray-50"
                :class="{
                  'ring-2 ring-green-500': selectedSectionIndex === sidx,
                }"
                @click.stop="selectSection(sidx)"
              >
                <!-- هدر سکشن با قابلیت درگ و کلیک برای تنظیمات -->
                <div
                  class="section-handle flex justify-between items-center bg-gray-200 px-3 py-2 cursor-move"
                >
                  <div class="flex items-center space-x-2 group">
                    <span class="text-gray-500 group-hover:text-gray-700"
                      >≡</span
                    >
                    <h3 class="font-semibold text-gray-800">
                      {{ section.title }}
                    </h3>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button
                      v-if="section.collapsible"
                      @click.stop="toggleSection(sidx)"
                      class="text-gray-600 hover:text-gray-800"
                    >
                      <Icon
                        :name="`fa6-solid:${
                          section._open ? 'chevron-down' : 'chevron-left'
                        }`"
                      />
                    </button>
                    <button
                      @click.stop="onDeleteSection(sidx)"
                      class="text-red-600 hover:text-red-800"
                      title="حذف سکشن"
                    >
                      <Icon name="fa6-solid:trash-can" />
                    </button>
                  </div>
                </div>

                <!-- محتویات سکشن (Draggable فیلدها) -->
                <Vue3SlideUpDown v-model="section._open">
                  <div
                    v-show="!section.collapsible || section._open"
                    class="p-3 space-y-3"
                  >
                    <!-- اگر سکشن خالی باشد -->
                    <div
                      v-if="!section.fields.length"
                      class="text-gray-400 text-center py-8"
                    >
                      <p>این سکشن خالی است.</p>
                      <p>
                        بعد از انتخاب این سکشن، روی یک نوع فیلد در Palette کلیک
                        کنید.
                      </p>
                    </div>

                    <!-- Draggable فیلدها -->
                    <draggable
                      v-else
                      v-model="section.fields"
                      handle=".field-handle"
                      item-key="key"
                      class="space-y-2"
                    >
                      <template #item="{ element: field, index: fidx }">
                        <div
                          v-if="!field.showIf || field.showIf(formValues)"
                          :class="[
                            'flex items-center justify-between bg-white border rounded px-3 py-2 cursor-move',
                            field.key === activeFieldKey
                              ? 'ring-2 ring-blue-400'
                              : '',
                          ]"
                          @click.stop="selectField(field.key)"
                        >
                          <div class="flex items-center space-x-2">
                            <span
                              class="field-handle text-gray-400 group-hover:text-gray-600"
                              >≡</span
                            >
                            <span class="text-gray-800">{{
                              field.label || field.type
                            }}</span>
                          </div>
                          <button
                            @click.stop="onDeleteField(field.key)"
                            class="text-red-600 hover:text-red-800"
                            title="حذف فیلد"
                          >
                            <Icon name="fa6-solid:trash-can" />
                          </button>
                        </div>
                      </template>
                    </draggable>
                  </div>
                </Vue3SlideUpDown>
              </div>
            </template>
          </draggable>

          <!-- اگر هیچ سکشنی وجود ندارد -->
          <div
            v-if="!config.sections.length"
            class="flex-1 flex items-center justify-center text-gray-400"
          >
            هیچ سکشنی وجود ندارد. لطفاً ابتدا یک سکشن جدید اضافه کنید.
          </div>
        </div>
      </main>

      <!-- ========== ستون راست: FieldPalette و افزودن سکشن ====== -->
      <aside
        class="w-1/4 bg-gray-50 border-l border-gray-300 p-4 overflow-auto"
      >
        <FieldPalette @selectFieldType="onSelectFieldType" />

        <div class="mt-6">
          <button
            class="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            @click="addNewSection"
            :disabled="showPreview"
          >
            + افزودن بخش جدید
          </button>
        </div>
      </aside>
    </div>

    <!-- ========== MODAL برای نمایش JSON کانفیگ ====== -->
    <transition name="fade">
      <div
        v-if="showGenerateModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg w-3/4 max-w-2xl p-4 space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">کد JSON کانفیگ فرم</h3>
            <button
              @click="showGenerateModal = false"
              class="text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
          </div>
          <textarea
            v-model="generatedJson"
            class="w-full h-64 px-2 py-1 border rounded font-mono text-sm"
            readonly
          ></textarea>
          <div class="flex justify-end">
            <button
              @click="copyFullPage"
              class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              📋 کپی به کلیپ‌بورد
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from "vue";
import Draggable from "vuedraggable"; // vue-draggable@next
import { Vue3SlideUpDown } from "vue3-slide-up-down";
import PreviewP from "../components/PreviewP.vue";
import { Raw } from "vue";
import { definePageMeta } from '#imports'

definePageMeta({ auth: false })

// -----------------------------
//  ۱. TYPE DEFINITIONS
// -----------------------------
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
  tooltip?: string;
  icon?: string;
  required?: boolean;
  disabled?: boolean;
  layout?: { colSpan?: ResponsiveProp<number> };
  showIf?: (values: Record<string, any>) => boolean;
  items?: Array<{ label: string; value: any }>;
  options?: Array<{ label: string; value: any }>;
  direction?: ResponsiveProp<"vertical" | "horizontal">;
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

// -----------------------------
//  ۲. STATE اصلی (Reactive)
// -----------------------------
const config = reactive<FormConfig>({
  formProps: {
    title: "فرم نمونه",
    columns: { base: 1, md: 2 },
    disabledAll: false,
    loading: false,
    loadingMode: "spinner",
    showErrorsAs: "inline",
    autoSaveKey: "",
    direction: "rtl",
    validationMode: "onChange",
    defaultValues: {},
  },
  sections: [
    {
      title: "بخش اول",
      collapsible: true,
      _open: true,
      fields: [
        {
          key: "name",
          type: "text",
          label: "نام",
          placeholder: "نام خود را وارد کنید",
          required: true,
          layout: { colSpan: { base: 1, md: 1 } },
        },
      ],
    },
  ],
  submitButton: {
    text: "ارسال",
    variant: "solid",
    color: "primary-100",
    pending: false,
  },
});

const formValues = reactive<Record<string, any>>({});
const formErrors = reactive<Record<string, string>>({});

// این تابع یک‌بار قبل از رندر اولیه فراخوانی می‌شود
function initializeFormState() {
  // ابتدا پاک می‌کنیم
  Object.keys(formValues).forEach((k) => delete formValues[k]);
  Object.keys(formErrors).forEach((k) => delete formErrors[k]);

  // سپس بر اساس سکشن‌ها و فیلدها مقداردهی اولیه می‌کنیم
  config.sections.forEach((section) => {
    section.fields.forEach((f) => {
      if (config.formProps.defaultValues?.[f.key] !== undefined) {
        formValues[f.key] = config.formProps.defaultValues[f.key];
      } else {
        switch (f.type) {
          case "checkboxGroup":
          case "array":
            formValues[f.key] = [];
            break;
          case "toggle":
            formValues[f.key] = false;
            break;
          case "file":
            formValues[f.key] = f.multipleFile ? [] : null;
            break;
          default:
            formValues[f.key] = "";
        }
      }
      formErrors[f.key] = "";
    });
  });
}

// قبل از اولین رندر
initializeFormState();

// -----------------------------
//  ۳. STATE برای پنل‌ها و پیش‌نمایش
// -----------------------------
const activeFieldKey = ref<string | null>(null);
const sectionEditingIndex = ref<number | null>(null);
const formSettingsOpen = ref(false);
const showPreview = ref(false);

// **اضافه شده: سکشن منتخب (برای افزودن فیلد)**
const selectedSectionIndex = ref<number | null>(null);

// وضعیت مودال نمایش JSON
const showGenerateModal = ref(false);
const generatedJson = ref("");

// -----------------------------
//  ۴. COMPUTEDها
// -----------------------------
const allFields = computed<FieldConfig[]>(() =>
  config.sections.flatMap((sec) => sec.fields)
);

const activeField = computed<FieldConfig | null>(() => {
  if (!activeFieldKey.value) return null;
  for (const sec of config.sections) {
    const found = sec.fields.find((f) => f.key === activeFieldKey.value);
    if (found) return found;
  }
  return null;
});

const gridClass = computed(() => {
  const cols = config.formProps.columns?.md || 1;
  if (cols === 2) return "grid grid-cols-1 md:grid-cols-2 gap-4";
  if (cols === 3) return "grid grid-cols-1 md:grid-cols-3 gap-4";
  return "grid grid-cols-1 gap-4";
});

// -----------------------------
//  ۵. WATCHها
// -----------------------------
watch(
  () => config.sections.map((sec) => sec.fields.map((f) => f.key)),
  () => {
    initializeFormState();
  },
  { deep: true }
);

watch(
  () => allFields.value.map((f) => f.key),
  (newKeys) => {
    if (activeFieldKey.value && !newKeys.includes(activeFieldKey.value)) {
      activeFieldKey.value = null;
    }
  }
);

// -----------------------------
//  ۶. HANDLERها
// -----------------------------

/** وقتی روی یک سکشن کلیک می‌شود: آن سکشن را «منتخب» می‌کنیم */
function selectSection(sidx: number) {
  selectedSectionIndex.value =
    selectedSectionIndex.value === sidx ? null : sidx;

  activeFieldKey.value = null;
  sectionEditingIndex.value = sidx;
  formSettingsOpen.value = false;
  showPreview.value = false;
}
function selectField(key: string) {
  activeFieldKey.value = key;
  sectionEditingIndex.value = null;
  formSettingsOpen.value = false;
  showPreview.value = false;
}

/** وقتی کاربر از FieldPalette نوع فیلد را انتخاب می‌کند */
function onSelectFieldType(type: string) {
  // اگر هنوز سکشن منتخب نداریم، اول یک سکشن جدید بسازیم
  if (selectedSectionIndex.value === null) {
    addNewSection();
    selectedSectionIndex.value = config.sections.length - 1;
  }

  // سپس فیلد جدید را داخل آن سکشن اضافه می‌کنیم
  const sidx = selectedSectionIndex.value!;
  const key = `field_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const newField: FieldConfig = {
    key,
    type,
    label: `فیلد ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    placeholder: "",
    required: false,
    disabled: false,
    layout: { colSpan: { base: 1, md: 1 } },
    showIf: undefined,
    tooltip: "",
    icon: "",
    items: type === "select" ? [] : undefined,
    options: type === "checkboxGroup" || type === "radioGroup" ? [] : undefined,
    direction: { base: "vertical" },
    multipleFile: false,
    itemFields: type === "array" ? [] : undefined,
    minItems: type === "array" ? 0 : undefined,
    maxItems: type === "array" ? Infinity : undefined,
  };

  config.sections[sidx].fields.push(newField);

  // مقدار اولیهٔ formValues و formErrors
  if (newField.type === "checkboxGroup" || newField.type === "array") {
    formValues[newField.key] = [];
  } else if (newField.type === "toggle") {
    formValues[newField.key] = false;
  } else if (newField.type === "file") {
    formValues[newField.key] = newField.multipleFile ? [] : null;
  } else {
    formValues[newField.key] = "";
  }
  formErrors[newField.key] = "";

  // فوراً آن فیلد را برای ویرایش انتخاب می‌کنیم
  nextTick(() => {
    activeFieldKey.value = newField.key;
    // اگر بخواهید پس از افزودن فیلد، انتخاب سکشن را لغو کنید، خط زیر را فعال کنید:
    // selectedSectionIndex.value = null;
  });
}

/** وقتی در PropertiesPanel فیلد تغییر کرد */
function onUpdateField(updatedField: FieldConfig) {
  for (const sec of config.sections) {
    const idx = sec.fields.findIndex((f) => f.key === updatedField.key);
    if (idx !== -1) {
      sec.fields[idx] = { ...updatedField };
      break;
    }
  }
}

/** زمانی که نام کلید فیلد تغییر کرد */
function onRenameField(payload: { oldKey: string; newKey: string }) {
  const { oldKey, newKey } = payload;

  if (formValues[oldKey] !== undefined) {
    formValues[newKey] = formValues[oldKey];
    delete formValues[oldKey];
  }

  if (formErrors[oldKey] !== undefined) {
    formErrors[newKey] = formErrors[oldKey];
    delete formErrors[oldKey];
  }

  for (const sec of config.sections) {
    const idx = sec.fields.findIndex((f) => f.key === oldKey);
    if (idx !== -1) {
      sec.fields[idx].key = newKey;
      break;
    }
  }

  if (activeFieldKey.value === oldKey) {
    activeFieldKey.value = newKey;
  }
}

/** زمانی که کاربر بخواهد فیلد را حذف کند */
function onDeleteField(fieldKey: string) {
  for (const sec of config.sections) {
    const idx = sec.fields.findIndex((f) => f.key === fieldKey);
    if (idx !== -1) {
      sec.fields.splice(idx, 1);
      break;
    }
  }
  delete formValues[fieldKey];
  delete formErrors[fieldKey];
  if (activeFieldKey.value === fieldKey) {
    activeFieldKey.value = null;
  }
}

/** باز کردن SectionSettingsPanel */
function openSectionSettings(index: number) {
  sectionEditingIndex.value = index;
  activeFieldKey.value = null;
  formSettingsOpen.value = false;
  showPreview.value = false;
}

/** بروزرسانی سکشن */
function onUpdateSection(updated: SectionConfig) {
  if (sectionEditingIndex.value === null) return;
  config.sections[sectionEditingIndex.value] = { ...updated };
}

/** حذف سکشن */
function onDeleteSection(idx: number = sectionEditingIndex.value!) {
  const keysToRemove = config.sections[idx].fields.map((f) => f.key);
  keysToRemove.forEach((k) => delete formValues[k]);
  keysToRemove.forEach((k) => delete formErrors[k]);
  config.sections.splice(idx, 1);
  sectionEditingIndex.value = null;
  if (selectedSectionIndex.value === idx) {
    selectedSectionIndex.value = null;
  }
}

/** باز/بستن پنجرهٔ فرم تنظیمات */
function openFormSettings() {
  formSettingsOpen.value = true;
  activeFieldKey.value = null;
  sectionEditingIndex.value = null;
  showPreview.value = false;
}

/** دریافت تغییرات تنظیمات فرم */
function onUpdateFormProps(updated: Partial<typeof config.formProps>) {
  config.formProps = { ...config.formProps, ...updated };
}

/** افزودن سکشن جدید */
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
  showPreview.value = false;
}

/** هنگام ارسال فرم در پیش‌نمایش */
function onSubmitForm(values: Record<string, any>) {
  console.log("فرم پیش‌نمایش ارسال شد با مقادیر:", values);
}

/** هنگام خطای اعتبارسنجی در پیش‌نمایش */
function onValidationError(payload: { field: string; message: string }) {
  console.log("خطای اعتبارسنجی در پیش‌نمایش:", payload.field, payload.message);
}

/** باز/بستن پیش‌نمایش */
function togglePreview() {
  showPreview.value = !showPreview.value;
  if (showPreview.value) {
    activeFieldKey.value = null;
    sectionEditingIndex.value = null;
    formSettingsOpen.value = false;
  }
}

/** تولید JSON کانفیگ کنونی */
async function copyFullPage() {
  // ۱. آبجکت خامِ reactive config
  const plainConfig = toRaw(config);

  // ۲. استخراج defaultValues به عنوان initialValues
  const initialVals = plainConfig.formProps.defaultValues || {};

  // ۳. ساخت SFC به صورت یک رشته
  const code = `
<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box class="max-w-4xl mx-auto py-8">
        <Header class="text-3xl font-bold mb-6">
          نمونه صفحه فرم با تمام قابلیت‌ها
        </Header>

        <FormBuilder
          :config="formConfig"
          :initialValues="initialValues"
          @validationError="onValidationError"
          @submitForm="onSubmitForm"
        />
      </Box>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
// مقادیر اولیهٔ فرم
const initialValues = ${JSON.stringify(initialVals, null, 2)}

// کانفیگِ نهاییِ فرم
const formConfig    = ${JSON.stringify(plainConfig, null, 2)}

function onValidationError({
  field,
  message,
}: {
  field: string
  message: string
}) {
  alert('خطا در فیلد «' + field + '»: ' + message)
}

async function onSubmitForm(values: Record<string, any>) {
  // TODO: منطق ارسال فرم
}
<\/script>
`.trim();

  // ۴. کپی به کلیپ‌بورد
  try {
    await navigator.clipboard.writeText(code);
    alert("کد کامل صفحه در کلیپ‌بورد کپی شد!");
  } catch {
    alert("خطا در کپی به کلیپ‌بورد");
  }
}
/** کپی JSON به کلیپ‌بورد */
async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(generatedJson.value);
    alert("کپی شد!");
  } catch {
    alert("کپی به کلیپ‌بورد ممکن نشد.");
  }
}

/** بارگذاری کانفیگ از JSON یا آبجکت JS */
/** بارگذاری کانفیگ از JS/TS با استخراج دقیق بلوک آبجکت */
function importConfigFromCode() {
  const code = window.prompt("کد کانفیگ را اینجا پیست کنید:", "");
  if (!code) return;

  try {
    // ۱. پاک‌سازی اولیه
    let text = code.trim();

    // ۲. حذف کامنت‌های تک‌خطی و چند‌خطی
    text = text
      .replace(/\/\/.*$/gm, "") // //…
      .replace(/\/\*[\s\S]*?\*\//g, ""); // /*…*/

    // ۳. حذف انوتیشن‌های TS در پارامترهای فانکشن
    text = text.replace(/\(\s*([A-Za-z0-9_$]+)\s*:\s*[^)]+\)/g, "($1)");

    // ۴. پیدا کردن اولین '{' و جفتش
    const startIdx = text.indexOf("{");
    if (startIdx === -1) throw new Error('بلوک "{" پیدا نشد.');
    let depth = 0,
      endIdx = -1;
    for (let i = startIdx; i < text.length; i++) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}") {
        depth--;
        if (depth === 0) {
          endIdx = i;
          break;
        }
      }
    }
    if (endIdx === -1) throw new Error('بلوک "}" متناسب پیدا نشد.');

    // ۵. استخراج رشته‌ی بلوک آبجکت
    const objCode = text.slice(startIdx, endIdx + 1);

    // ۶. اجرا و گرفتن JS Object
    const parsed: FormConfig = new Function(`return ${objCode};`)();

    // ۷. اعمال روی reactive config
    config.formProps = { ...parsed.formProps };
    config.sections.splice(0, config.sections.length, ...parsed.sections);
    config.submitButton = { ...parsed.submitButton };

    // ۸. مقداردهی مجدد فرم و بستن پیش‌نمایش
    initializeFormState();
    showPreview.value = false;
    alert("کانفیگ فرم با موفقیت بارگذاری شد.");
  } catch (e: any) {
    console.error(e);
    alert("خطا در بارگذاری کانفیگ: " + e.message);
  }
}
function onUpdateSubmitButton(updated: Partial<typeof config.submitButton>) {
  config.submitButton = { ...config.submitButton, ...updated }
}
</script>

<style scoped>
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
/* برای Draggable */
.section-handle:hover,
.field-handle:hover {
  color: #4b5563; /* gray-700 */
}
</style>
