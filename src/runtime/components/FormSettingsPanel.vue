<template>
  <div class="p-4 bg-white border rounded-lg shadow-md w-full space-y-4">
    <!-- ===== Header ===== -->
    <h3 class="text-lg font-medium">تنظیمات فرم</h3>

    <!-- ===== Form Title ===== -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">عنوان فرم</label>
      <input
        v-model="localTitle"
        @input="emitUpdate('title', localTitle)"
        type="text"
        class="w-full px-2 py-1 border rounded"
        placeholder="مثلاً: فرم ثبت‌نام"
      />
    </div>

    <!-- ===== Columns (Responsive) ===== -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">تعداد ستون‌ها</label>
      <div class="grid grid-cols-5 gap-2">
        <div v-for="br in breakpoints" :key="br.key" class="flex flex-col">
          <label class="text-xs text-gray-600">{{ br.label }}</label>
          <input
            type="number"
            min="1"
            v-model.number="localColumns[br.key]"
            @input="emitColumns"
            class="px-2 py-1 border rounded text-sm"
            :placeholder="`مثلاً ${br.default}`"
          />
        </div>
      </div>
      <p class="mt-1 text-xs text-gray-500">
        می‌توانید برای هر نقطهٔ شکست (breakpoint) تعداد ستون را تعیین کنید.
      </p>
    </div>

    <!-- ===== Disable All Fields ===== -->
    <div class="flex items-center space-x-2">
      <input
        type="checkbox"
        v-model="localDisabledAll"
        @change="emitUpdate('disabledAll', localDisabledAll)"
        class="form-checkbox h-5 w-5 text-blue-600"
        id="disabledAllCheckbox"
      />
      <label for="disabledAllCheckbox" class="text-sm">غیرفعال‌سازی کلیهٔ فیلدها</label>
    </div>

    <!-- ===== Loading & Loading Mode ===== -->
    <div class="space-y-2">
      <!-- فعال/غیرفعال کردن حالت بارگذاری -->
      <div class="flex items-center space-x-2">
        <input
          type="checkbox"
          v-model="localLoading"
          @change="emitUpdate('loading', localLoading)"
          class="form-checkbox h-5 w-5 text-blue-600"
          id="loadingCheckbox"
        />
        <label for="loadingCheckbox" class="text-sm">حالت بارگذاری فعال باشد</label>
      </div>

      <!-- اگر حالت بارگذاری فعال باشد: انتخاب نوع آن -->
      <div  class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Loading Mode</label>
        <select
          v-model="localLoadingMode"
          @change="emitUpdate('loadingMode', localLoadingMode)"
          class="w-full px-2 py-1 border rounded text-sm"
        >
          <option value="skeleton">Skeleton</option>
          <option value="spinner">Spinner</option>
          <option value="button">Button</option>
        </select>
        <p class="mt-1 text-xs text-gray-500">
          با انتخاب هر حالت، کامپوننت فرم مطابقِ آن رفتار خواهد کرد.
        </p>
      </div>
    </div>

    <!-- ===== Error Display Mode ===== -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">نحوهٔ نمایش ارورها</label>
      <select
        v-model="localShowErrorsAs"
        @change="emitUpdate('showErrorsAs', localShowErrorsAs)"
        class="w-full px-2 py-1 border rounded text-sm"
      >
        <option value="inline">درون هر فیلد</option>
        <option value="notify">اعلان</option>
      </select>
    </div>

    <!-- ===== Auto-Save Key ===== -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">کلید ذخیرهٔ خودکار</label>
      <input
        v-model="localAutoSaveKey"
        @input="emitUpdate('autoSaveKey', localAutoSaveKey)"
        type="text"
        class="w-full px-2 py-1 border rounded"
        placeholder="مثلاً: myFormDraft"
      />
      <p class="mt-1 text-xs text-gray-500">اگر خالی بگذارید، ذخیرهٔ خودکار فعال نمی‌شود.</p>
    </div>

    <!-- ===== Direction (RTL / LTR) ===== -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">جهت فرم</label>
      <select
        v-model="localDirection"
        @change="emitUpdate('direction', localDirection)"
        class="w-full px-2 py-1 border rounded text-sm"
      >
        <option value="rtl">راست به چپ (RTL)</option>
        <option value="ltr">چپ به راست (LTR)</option>
      </select>
    </div>

    <!-- ===== Validation Mode ===== -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">حالت اعتبارسنجی</label>
      <select
        v-model="localValidationMode"
        @change="emitUpdate('validationMode', localValidationMode)"
        class="w-full px-2 py-1 border rounded text-sm"
      >
        <option value="onChange">همزمان با تغییر</option>
        <option value="onBlur">هنگام خروج از فیلد</option>
        <option value="onSubmit">هنگام ارسال</option>
      </select>
    </div>

    <!-- ===== Default Values (optional) ===== -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">مقادیر پیش‌فرض (JSON)</label>
      <textarea
        v-model="localDefaultValuesJson"
        @blur="onDefaultValuesBlur"
        rows="3"
        class="w-full px-2 py-1 border rounded text-sm font-mono"
        placeholder='{"firstName": "علی", "email": "example@..." }'
      ></textarea>
      <p class="mt-1 text-xs text-gray-500">
        اگر چیزی ننویسید، مقادیر پیش‌فرض وجود نخواهد داشت.
      </p>
    </div>

    <!-- ===== Bottom: Close Button ===== -->
    <div class="flex justify-end">
      <button
        @click="onClose"
        class="px-3 py-1 text-gray-700 border rounded hover:bg-gray-100"
      >
        بستن
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import type { PropType } from "vue";

// دریافت props از والد: همان formProps که در config تعریف شده
const props = defineProps<{
  formProps: {
    title?: string;
    columns?: Record<string, number>;
    disabledAll?: boolean;
    loading?: boolean;
    loadingMode?: "skeleton" | "spinner" | "button";
    showErrorsAs?: "inline" | "notify";
    autoSaveKey?: string;
    direction?: "rtl" | "ltr";
    validationMode?: "onChange" | "onBlur" | "onSubmit";
    defaultValues?: Record<string, any>;
  };
}>();

// تعریف ایونت‌ها
const emit = defineEmits<{
  (e: "updateFormProps", updated: Partial<typeof props.formProps>): void;
  (e: "closePanel"): void;
}>();

// — عنوان فرم —
const localTitle = ref(props.formProps.title || "");

// — ستون‌ها در نقاط شکست (breakpoints) —
const defaultCols = { base: 1, sm: 1, md: 1, lg: 1, xl: 1 };
const localColumns = reactive<Record<string, number>>({
  base: props.formProps.columns?.base ?? defaultCols.base,
  sm: props.formProps.columns?.sm ?? defaultCols.sm,
  md: props.formProps.columns?.md ?? defaultCols.md,
  lg: props.formProps.columns?.lg ?? defaultCols.lg,
  xl: props.formProps.columns?.xl ?? defaultCols.xl,
});
const breakpoints = [
  { key: "base", label: "Base", default: 1 },
  { key: "sm", label: "SM", default: 1 },
  { key: "md", label: "MD", default: 1 },
  { key: "lg", label: "LG", default: 1 },
  { key: "xl", label: "XL", default: 1 },
];

// — غیرفعال‌سازی همهٔ فیلدها —
const localDisabledAll = ref(!!props.formProps.disabledAll);

// — حالت بارگذاری و حالت آن —
const localLoading = ref(!!props.formProps.loading);
const localLoadingMode = ref(props.formProps.loadingMode || "spinner");

// — نمایش ارورها —
const localShowErrorsAs = ref(props.formProps.showErrorsAs || "inline");

// — کلید ذخیرهٔ خودکار —
const localAutoSaveKey = ref(props.formProps.autoSaveKey || "");

// — جهت (RTL / LTR) —
const localDirection = ref(props.formProps.direction || "rtl");

// — حالت اعتبارسنجی —
const localValidationMode = ref(props.formProps.validationMode || "onChange");

// — مقادیر پیش‌فرض (JSON) —
const localDefaultValuesJson = ref(
  props.formProps.defaultValues
    ? JSON.stringify(props.formProps.defaultValues, null, 2)
    : ""
);

// اگر والد formProps تغییر کرد، مقادیر محلی هم به‌روز شوند:
watch(
  () => props.formProps,
  (newFP) => {
    localTitle.value = newFP.title || "";
    localColumns.base = newFP.columns?.base ?? defaultCols.base;
    localColumns.sm = newFP.columns?.sm ?? defaultCols.sm;
    localColumns.md = newFP.columns?.md ?? defaultCols.md;
    localColumns.lg = newFP.columns?.lg ?? defaultCols.lg;
    localColumns.xl = newFP.columns?.xl ?? defaultCols.xl;

    localDisabledAll.value = !!newFP.disabledAll;
    localLoading.value = !!newFP.loading;
    localLoadingMode.value = newFP.loadingMode || "spinner";
    localShowErrorsAs.value = newFP.showErrorsAs || "inline";
    localAutoSaveKey.value = newFP.autoSaveKey || "";
    localDirection.value = newFP.direction || "rtl";
    localValidationMode.value = newFP.validationMode || "onChange";
    localDefaultValuesJson.value = newFP.defaultValues
      ? JSON.stringify(newFP.defaultValues, null, 2)
      : "";
  },
  { immediate: true, deep: true }
);

// وقتی بخواهیم به والد بگوییم که فقط یک یا چند صفت از formProps تغییر کرده‌اند:
function emitUpdate(propName: keyof typeof props.formProps, value: any) {
  emit("updateFormProps", { [propName]: value });
}

// وقتی ستون‌ها تغییر کنند، کل آبجکت columns جدید emit می‌شود
function emitColumns() {
  const cleaned: Record<string, number> = {};
  for (const br of breakpoints) {
    if (localColumns[br.key] != null) {
      cleaned[br.key] = localColumns[br.key];
    }
  }
  emit("updateFormProps", { columns: cleaned });
}

// وقتی textarea مقادیر پیش‌فرض blur خورد، سعی می‌کنیم JSON را parse کنیم
function onDefaultValuesBlur() {
  const txt = localDefaultValuesJson.value.trim();
  if (!txt) {
    emit("updateFormProps", { defaultValues: undefined });
    return;
  }
  try {
    const parsed = JSON.parse(txt);
    if (typeof parsed === "object" && parsed !== null) {
      emit("updateFormProps", { defaultValues: parsed });
    }
  } catch {
    // JSON نامعتبر: emit نمی‌کنیم. می‌توانید پیام خطا نشان دهید.
  }
}

// وقتی کاربر روی “بستن” کلیک کند
function onClose() {
  emit("closePanel");
}
</script>

<style scoped>
/* اگر لازم است، اینجا استایل اضافه کنید */
</style>
