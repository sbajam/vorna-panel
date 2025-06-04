<template>
  <div>
    <h3 class="text-lg font-medium mb-4">Properties Panel</h3>
    <div v-if="field" class="space-y-6">
      <!-- ۱) بیایید ابتدا پراپرتی‌های مشترکِ Base (key, type) را غیرقابل ویرایش نشان دهیم -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Key</label>
        <input
          type="text"
          v-model="localField.key"
          disabled
          class="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <input
          type="text"
          v-model="localField.type"
          disabled
          class="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed"
        />
      </div>

      <!-- ۲) بقیهٔ پراپرتی‌ها را از FIELD_SCHEMA[type] بخوانیم -->
      <div
        v-for="propDef in propertyList"
        :key="propDef.key"
        class="space-y-2"
      >
        <!-- اگر فقط برای type خاصی باشد اما این فیلد از آن نوع نیست، skip -->
        <component
          v-if="isPropApplicable(propDef)"
          :is="getInputComponent(propDef)"
          :prop-def="propDef"
          v-model="localField[propDef.key]"
          @update="emitUpdateField"
        />
      </div>

      <!-- دکمه حذف فیلد -->
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
import { reactive, ref, toRefs, computed, defineProps, defineEmits } from "vue";
import type { PropertyDefinition } from "../composables/field-schema";
import { FIELD_SCHEMA } from "../composables/field-schema";

const emits = defineEmits<{
  (e: "updateField", field: any): void;
  (e: "deleteField", key: string): void;
}>();

const props = defineProps<{
  field: any;
}>();

// یک نسخهٔ reactive از props.field می‌سازیم
const localField = reactive({ ...props.field });

// شیء propertyList با توجه به نوع فیلد فعلی
const propertyList = computed<PropertyDefinition[]>(() => {
  const t: string = localField.type;
  return FIELD_SCHEMA[t] || [];
});

// بررسی می‌کنیم آیا این پراپرتی باید در این نوع فیلد نمایش داده شود
function isPropApplicable(propDef: PropertyDefinition) {
  if (propDef.onlyForTypes && propDef.onlyForTypes.length > 0) {
    return propDef.onlyForTypes.includes(localField.type);
  }
  return true;
}

// متدی که component مناسب را بر اساس inputType برمی‌گرداند
/**
 * چند مثال component پیشنهادی:
 *   - برای inputType === "text": <TextInput /> 
 *   - برای inputType === "number": <NumberInput />
 *   - برای inputType === "checkbox": <CheckboxInput />
 *   - برای inputType === "textarea": <TextareaInput />
 *   - برای inputType === "select": <SelectInput :options="propDef.options" />
 *   - برای inputType === "object": <ResponsiveObjectInput :children="propDef.children" />
 *   - برای inputType === "array": <ArrayInput :itemSchema="propDef.arrayItemSchema" />
 *   - برای inputType === "code": <CodeEditorInput />
 * 
 * می‌توانید این کامپوننت‌ها را خودتان بسازید یا ساده‌تر، 
 * به‌صورت یک <DynamicField> واحد بنویسید که درونش switch روی propDef.inputType بزند و 
 * خودش خروجی مناسب را رندر کند.
 */
function getInputComponent(propDef: PropertyDefinition) {
  switch (propDef.inputType) {
    case "text":
      return "TextInput";
    case "number":
      return "NumberInput";
    case "checkbox":
      return "CheckboxInput";
    case "textarea":
      return "TextareaInput";
    case "select":
      return "SelectInput";
    case "color":
      return "TextInput"; // یا ColorPicker
    case "code":
      return "CodeEditorInput";
    case "object":
      return "ResponsiveObjectInput";
    case "array":
      return "ArrayInput";
    default:
      return "TextInput";
  }
}

// هر بار تغییر دادیم، emit را اجرا می‌کنیم
function emitUpdateField() {
  emits("updateField", { ...localField });
}

// برای حذف فیلد
function confirmDelete() {
  if (window.confirm("آیا مطمئن هستید که می‌خواهید این فیلد را حذف کنید؟")) {
    emits("deleteField", localField.key);
  }
}
</script>

<style scoped>
/* استایل دلخواه */
</style>
