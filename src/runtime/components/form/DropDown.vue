<template>
  <!--
    DropDown Component
    - Single or multiple select with search
    - Label support (top or right), placeholder, disabled, error display
    - Clearable selection
  -->
  <div
    :class="[
      'input-div',
      labelPosition === 'top' ? 'flex-col !items-start' : '',
    ]"
  >
    <!-- Label -->
    <label
      v-if="label"
      class="text-primary-100 text-lg font-semibold w-4/12 text-right whitespace-nowrap"
    >
      {{ label }}
    </label>
    <div class="w-full relative">
      <Menu as="div" class="relative inline-block text-left w-full">
        <!-- Button -->
        <MenuButton
          :class="[
            'flex w-full justify-between items-center hover:!shadow-none hover:!translate-y-none  px-4 py-2 bg-white border-2 rounded-lg',
            disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:border-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-100',
            errorMessage ? 'border-red-500' : 'border-gray-100',
          ]"
          :disabled="disabled"
        >
          <div class="runcate text-right">
            <!-- Single select -->
            <template v-if="!multiple">
              <template v-if="!selectedItem">
                {{ placeholder }}
              </template>
              <template v-else>
                {{ selectedText || placeholder }}
              </template>
            </template>

            <!-- Multiple select (بدون تغییر اساسی) -->
            <template v-else>
              <span v-if="internalValueArray.length">
                {{
                  internalValueArray
                    .map((v) => {
                      // پیدا کردن آیتم متناظر با value (با مقایسهٔ isEqual)
                      const item = items.find((i) => isEqual(getValue(i), v));
                      return item ? getDisplay(item) : "";
                    })
                    .filter(Boolean)
                    .join(", ")
                }}
              </span>
              <span v-else class="text-gray-400">{{ placeholder }}</span>
            </template>
          </div>

          <div class="flex !w-fit items-center justify-between gap-2">
            <!-- Clear icon -->
            <div
              v-if="
                clearable &&
                (multiple
                  ? internalValueArray.length > 0
                  : internalValue != null)
              "
              @click.stop="clearSelection"
              class="p-1 hover:bg-gray-100 rounded-full cursor-pointer !w-fit"
            >
              <XMarkIcon class="h-4 w-4 text-gray-500" />
            </div>
            <ChevronDownIcon class="h-5 w-5 text-gray-400" />
          </div>
        </MenuButton>

        <!-- Dropdown Items -->
        <MenuItems
          class="absolute mt-1 min-w-fit w-full bg-white shadow-lg max-h-60 overflow-auto rounded-lg z-[10000]"
        >
          <!-- Search field -->
          <div v-if="searchable" class="p-2">
            <input
              v-model="search"
              type="text"
              :placeholder="searchPlaceholder"
              class="w-full px-2 py-1 border rounded focus:outline-none"
              :disabled="disabled"
            />
          </div>

          <!-- Empty message -->
          <div
            v-if="filteredItems.length === 0"
            class="p-2 text-center text-sm text-gray-500"
          >
            {{ emptyMessage }}
          </div>

          <!-- Options -->
          <MenuItem
            as="template"
            v-for="(item, idx) in filteredItems"
            :key="idx"
          >
            <template #default="{ active }">
              <div
                @click="toggle(item)"
                :class="[
                  'px-4 py-2 flex items-center gap-2 cursor-pointer',
                  active ? 'bg-gray-100' : '',
                  idx < filteredItems.length - 1
                    ? 'border-b border-gray-200'
                    : '',
                ]"
              >
                <!-- Checkbox for multiple -->
                <input
                  v-if="multiple"
                  type="checkbox"
                  :checked="isSelected(item)"
                  class="form-checkbox h-4 !w-4 text-blue-600"
                />
                <span>{{ getLabel(item) }}</span>
              </div>
            </template>
          </MenuItem>
        </MenuItems>
      </Menu>

      <!-- Error Message -->
      <p v-if="errorMessage" class="text-sm text-red-600 mt-1">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { PropType } from "vue";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/vue/20/solid";

const props = defineProps({
  items: { type: Array as PropType<any[]>, required: true },
  modelValue: {
    type: [String, Number, Boolean, Array, Object, null] as PropType<any>,
    default: null,
  },
  multiple: { type: Boolean, default: false },
  searchable: { type: Boolean, default: false },
  placeholder: { type: String, default: "انتخاب کنید" },
  searchPlaceholder: { type: String, default: "جستجو..." },
  emptyMessage: { type: String, default: "گزینه‌ای موجود نیست" },
  clearable: { type: Boolean, default: false },
  label: { type: String, default: "" },
  labelPosition: {
    type: String as PropType<"top" | "right">,
    default: "right",
  },
  disabled: { type: Boolean, default: false },
  errorMessage: { type: String, default: "" },

  // اگر '', undefined یا '.' باشند => کل آیتم استفاده شود
  labelField: { type: String, default: "label" },
  valueField: { type: String, default: "value" },
  displayField: { type: String, default: "" },
});

const emit = defineEmits<{ (e: "update:modelValue", value: any): void }>();

const search = ref("");
const internal = ref<any>(null);

internal.value = props.multiple
  ? Array.isArray(props.modelValue)
    ? [...props.modelValue]
    : []
  : props.modelValue;

watch(
  () => props.modelValue,
  (v) => {
    internal.value = props.multiple ? (Array.isArray(v) ? [...v] : []) : v;
  }
);

const isObj = (x: any) => x !== null && typeof x === "object";
const fieldIsWhole = (field?: string) => !field || field === ".";

// مقایسهٔ امن (برای وقتی که value = کل آبجکت است)
function isEqual(a: any, b: any) {
  if (isObj(a) && isObj(b)) {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return a === b;
    }
  }
  return a === b;
}

// گرفتن value: اگر valueField خالی/نقطه → کل آیتم
function getValue(item: any) {
  if (!isObj(item)) return item;
  if (fieldIsWhole(props.valueField)) return item;
  return item?.[props.valueField];
}

// گرفتن label: اگر labelField خالی/نقطه → کل آیتم (fallback به name → JSON)
function getLabel(item: any) {
  if (!isObj(item)) return String(item);
  if (!fieldIsWhole(props.labelField) && item?.[props.labelField] != null) {
    return String(item[props.labelField]);
  }
  // fallback
  if (
    props.displayField &&
    !fieldIsWhole(props.displayField) &&
    item?.[props.displayField] != null
  ) {
    return String(item[props.displayField]);
  }
  if ("name" in item && item.name != null) return String(item.name);
  try {
    return JSON.stringify(item);
  } catch {
    return String(item);
  }
}

// گرفتن display: اگر displayField خالی/نقطه → از getLabel استفاده کن
function getDisplay(item: any) {
  if (!isObj(item)) return String(item);
  if (!fieldIsWhole(props.displayField) && item?.[props.displayField] != null) {
    return String(item[props.displayField]);
  }
  return getLabel(item);
}

// فهرست فیلتر شده
const filteredItems = computed(() => {
  const items = Array.isArray(props.items) ? props.items : [];
  if (!props.searchable || !search.value) return items;
  const q = search.value.toLowerCase();
  return items.filter((item) => getLabel(item).toLowerCase().includes(q));
});

// انتخاب‌شدهٔ single
const selectedItem = computed(() => {
  if (props.multiple) return null;
  const items = Array.isArray(props.items) ? props.items : [];
  return items.find((i) => isEqual(getValue(i), internal.value)) ?? null;
});

const selectedText = computed(() => {
  if (props.multiple) return "";
  return selectedItem.value ? getDisplay(selectedItem.value) || "" : "";
});

function isSelected(item: any) {
  const v = getValue(item);
  if (props.multiple) {
    const arr = internal.value as any[];
    // شامل بودن با مقایسهٔ isEqual
    return arr.some((x) => isEqual(x, v));
  } else {
    return isEqual(internal.value, v);
  }
}

function toggle(item: any) {
  const v = getValue(item);
  if (props.multiple) {
    const arr = internal.value as any[];
    const idx = arr.findIndex((x) => isEqual(x, v));
    if (idx > -1) arr.splice(idx, 1);
    else arr.push(v);
    emit("update:modelValue", [...arr]);
  } else {
    internal.value = v;
    emit("update:modelValue", v);
  }
}

function clearSelection() {
  if (props.multiple) {
    internal.value = [];
    emit("update:modelValue", []);
  } else {
    internal.value = null;
    emit("update:modelValue", null);
  }
}

// برای template
const internalValue = computed(() => internal.value);
const internalValueArray = computed(() =>
  props.multiple
    ? (internal.value as any[])
    : internal.value != null
    ? [internal.value]
    : []
);
</script>

<style lang="scss" scoped>
.input-div {
  @apply relative flex flex-wrap md:flex-nowrap items-center gap-3 w-full px-4;
}
.input-div label {
  @apply text-primary-100 text-lg text-right whitespace-nowrap font-semibold w-4/12;
}
</style>
