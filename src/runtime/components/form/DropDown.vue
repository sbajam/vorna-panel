<template>
  <!--
    DropDown Component
    - Single or multiple select with search
    - Label support (top or right), placeholder, disabled, error display
    - Clearable selection
  -->
  <div :class="['input-div', labelPosition === 'top' ? 'flex-col !items-start' : '']">
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
            errorMessage ? 'border-red-500' : 'border-gray-100'
          ]"
          :disabled="disabled"
        >
          <div class=" runcate text-right">
            <!-- Single select: no value -->
            <template v-if="!multiple && internalValue == null">
              {{ placeholder }}
            </template>
            <!-- Single select: with value -->
            <template v-else-if="!multiple">
              {{ getDisplay(items.find(i => getValue(i) === internalValue)) || placeholder }}
            </template>
            <!-- Multiple select -->
            <template v-else>
              <span v-if="internalValueArray.length">
                {{ internalValueArray
                  .map(v => getDisplay(items.find(i => getValue(i) === v)))
                  .filter(Boolean)
                  .join(', ')
                }}
              </span>
              <span v-else class="text-gray-400">{{ placeholder }}</span>
            </template>
          </div>

          <div class="flex !w-fit items-center justify-between gap-2">
            <!-- Clear icon -->
            <div
              v-if="clearable && (multiple ? internalValueArray.length > 0 : internalValue != null)"
              @click.stop="clearSelection"
              class="p-1 hover:bg-gray-100 rounded-full cursor-pointer !w-fit"
            >
              <XMarkIcon class="h-4 w-4 text-gray-500" />
            </div>
            <ChevronDownIcon class="h-5 w-5 text-gray-400" />
          </div>
        </MenuButton>

        <!-- Dropdown Items -->
        <MenuItems class="absolute mt-1 min-w-fit  w-full bg-white shadow-lg max-h-60 overflow-auto rounded-lg z-[10000]">
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
                  idx < filteredItems.length - 1 ? 'border-b border-gray-200' : ''
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
import { ref, computed, watch } from 'vue'
import type { PropType } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { ChevronDownIcon, XMarkIcon } from '@heroicons/vue/20/solid'

// Define props for DropDown
const props = defineProps({
  items:           { type: Array as PropType<any[]>, required: true },
  modelValue:      { type: [String, Number, Array] as PropType<string|number|any[]>, default: null },
  multiple:        { type: Boolean, default: false },
  searchable:      { type: Boolean, default: false },
  placeholder:     { type: String, default: 'انتخاب کنید' },
  searchPlaceholder:{ type: String, default: 'جستجو...' },
  emptyMessage:    { type: String, default: 'گزینه‌ای موجود نیست' },
  clearable:       { type: Boolean, default: false },
  label:           { type: String, default: '' },
  labelPosition:   { type: String as PropType<'top'|'right'>, default: 'right' },
  disabled:        { type: Boolean, default: false },
  errorMessage:    { type: String, default: '' },
  labelField:      { type: String, default: 'label' },
  valueField:      { type: String, default: 'value' },
  displayField:    { type: String, default: '' },
  // returnObject:    { type: Boolean, default: true }
})
const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

// Internal reactive state
const search = ref('')
const internal = ref<any>(null)

// Initialize internal based on prop modelValue and multiple
internal.value = props.multiple
  ? (Array.isArray(props.modelValue) ? [...props.modelValue] : [])
  : props.modelValue

watch(
  () => props.modelValue,
  (v) => {
    internal.value = props.multiple
      ? (Array.isArray(v) ? [...v] : [])
      : v
  }
)

// Computed filtered items
const filteredItems = computed(() => {
  if (!props.searchable || !search.value) return props.items
  const q = search.value.toLowerCase()
  return props.items.filter(item =>
    getLabel(item).toLowerCase().includes(q)
  )
})

// Helpers
function getValue(item: any) { return typeof item === 'object' ? item[props.valueField] : item }
function getLabel(item: any) { return typeof item === 'object' ? item[props.labelField] : String(item) }

function getDisplay(item: any) {
  if (
    props.displayField &&
    typeof item === 'object' &&
    item[props.displayField] != null
  ) {
    return item[props.displayField]
  }
  return getLabel(item)
}

function isSelected(item: any) {
  const v = getValue(item)
  return props.multiple
    ? (internal.value as any[]).includes(v)
    : internal.value === v
}

// Toggle selection
function toggle(item: any) {
  const v = getValue(item)
  if (props.multiple) {
    const arr = internal.value as any[]
    const idx = arr.indexOf(v)
    if (idx > -1) arr.splice(idx, 1)
    else arr.push(v)
    emit('update:modelValue', [...arr])
  } else {
    internal.value = v
    emit('update:modelValue', v)
  }
}

// Clear selection
function clearSelection() {
  if (props.multiple) {
    internal.value = []
    emit('update:modelValue', [])
  } else {
    internal.value = null
    emit('update:modelValue', null)
  }
}

// Derived for template
const internalValue = computed(() => internal.value)
const internalValueArray = computed(() =>
  props.multiple ? (internal.value as any[]) : (internal.value != null ? [internal.value] : [])
)
</script>

<style lang="scss" scoped>
.input-div {
  @apply relative flex flex-wrap md:flex-nowrap items-center gap-3 w-full px-4;
}
.input-div label {
  @apply text-primary-100 text-lg text-right whitespace-nowrap font-semibold w-4/12;
}
</style>
