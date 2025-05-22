<!-- components/DropDown.vue -->
<script setup>
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { ChevronDownIcon, XMarkIcon } from '@heroicons/vue/20/solid'
/**
 * DropDown Component
 *
 * Props:
 * @prop {Array}           items         — **الزامی.** آرایه‌ای از آیتم‌ها (رشته یا آبجکت { label, value, ... }).
 * @prop {String|Number|Array} modelValue — مقدار یا مقادیر انتخاب‌شده. در حالت تک‌انتخابی String|Number، در حالت چندانتخابی Array.
 * @prop {Boolean}         multiple      — اگر true باشد، چندانتخابی است.
 * @prop {Boolean}         searchable    — اگر true باشد، فیلد جستجو نمایش داده می‌شود.
 * @prop {String}          emptyMessage  — متن نمایش در صورت خالی بودن لیست یا عدم تطابق با جستجو.
 * @prop {String}          placeholder   — متن پیش‌فرض دکمه قبل از انتخاب.
 * @prop {String}          labelField    — نام فیلد آبجکت برای نمایش متن آیتم (پیش‌فرض "label").
 * @prop {String}          valueField    — نام فیلد آبجکت برای مقدار ذخیره/برگردانده‌شده (پیش‌فرض "value").
 * @prop {String}          displayField  — اگر پر شود، به‌جای labelField نمایش داده می‌شود (مثلاً کد کشور).
 * @prop {Boolean}         clearable     — اگر true باشد، ایکون × برای پاک‌کردن انتخاب اضافه می‌شود.
 */
const props = defineProps({
  items:         { type: Array,                  required: true },
  modelValue:    { type: [String, Number, Array], default: () => null },
  multiple:      { type: Boolean,                default: false },
  searchable:    { type: Boolean,                default: false },
  emptyMessage:  { type: String,                 default: 'گزینه‌ای موجود نیست' },
  placeholder:   { type: String,                 default: 'انتخاب کنید' },
  labelField:    { type: String,                 default: 'label' },
  valueField:    { type: String,                 default: 'value' },
  displayField:  { type: String,                 default: '' },
  clearable:     { type: Boolean,                default: false },
})
const emit = defineEmits(['update:modelValue'])

const search   = ref('')
const internal = ref(
  props.multiple
    ? (Array.isArray(props.modelValue) ? [...props.modelValue] : [])
    : props.modelValue
)

watch(() => props.modelValue, v => {
  internal.value = props.multiple
    ? (Array.isArray(v) ? [...v] : [])
    : v
})

const filtered = computed(() => {
  if (!props.searchable || !search.value) return props.items
  const q = search.value.toLowerCase()
  return props.items.filter(item =>
    getLabel(item).toLowerCase().includes(q)
  )
})

function getValue(item) {
  return typeof item === 'object'
    ? (item[props.valueField] ?? '')
    : item
}
function getLabel(item) {
  return typeof item === 'object'
    ? (item[props.labelField] ?? '')
    : String(item)
}
function getDisplay(item) {
  if (
    props.displayField &&
    typeof item === 'object' &&
    item[props.displayField] != null
  ) return item[props.displayField]
  return getLabel(item)
}
function isSelected(item) {
  const v = getValue(item)
  return props.multiple
    ? internal.value.includes(v)
    : internal.value === v
}
function toggle(item) {
  const v = getValue(item)
  if (props.multiple) {
    const idx = internal.value.indexOf(v)
    if (idx >= 0) internal.value.splice(idx, 1)
    else internal.value.push(v)
    emit('update:modelValue', [...internal.value])
  } else {
    internal.value = v
    emit('update:modelValue', v)
  }
}
function clearSelection(e) {
  e.stopPropagation()
  if (props.multiple) {
    internal.value = []
    emit('update:modelValue', [])
  } else {
    internal.value = null
    emit('update:modelValue', null)
  }
}
</script>

<template>
  <Menu as="div" class="relative inline-block text-left w-60">
    <MenuButton
      class="flex w-full items-center justify-between px-4 py-2 bg-white border rounded-md shadow hover:bg-gray-50 hover:shadow-none hover:translate-x-0"
    >
      <div class="flex-1 truncate">
        <template v-if="!multiple && internal == null">
          {{ placeholder }}
        </template>
        <template v-else-if="!multiple">
          {{ getDisplay(items.find(i => getValue(i) === internal)) || placeholder }}
        </template>
        <template v-else>
          <span v-if="internal.length">
            {{ internal
               .map(v => getDisplay(items.find(i => getValue(i) === v)))
               .filter(Boolean)
               .join(', ')
            }}
          </span>
          <span v-else>{{ placeholder }}</span>
        </template>
      </div>
      <div class="flex items-center gap-2">
        <div
          v-if="clearable && ((multiple && internal.length) || (!multiple && internal != null))"
          @click="clearSelection"
          class="p-1 hover:bg-gray-100 rounded-full cursor-pointer"
        >
          <XMarkIcon class="h-4 w-4 text-gray-500" />
        </div>
        <ChevronDownIcon class="h-5 w-5 text-gray-400" />
      </div>
    </MenuButton>

    <MenuItems class="absolute mt-1 w-full bg-white shadow-lg max-h-60 overflow-auto rounded-md z-10">
      <div v-if="searchable" class="p-2">
        <input
          v-model="search"
          type="text"
          placeholder="جستجو..."
          class="w-full px-2 py-1 border rounded focus:outline-none"
        />
      </div>

      <div v-if="filtered.length === 0" class="p-2 text-center text-sm text-gray-500">
        {{ emptyMessage }}
      </div>

      <!-- اینجا MenuItem را با as="template" و template #default می‌گذاری -->
      <MenuItem as="template" v-for="(item, idx) in filtered" :key="idx">
        <template #default="{ active }">
          <div 
            @click="toggle(item)"
            :class="[
              'px-4 py-2 flex items-center gap-2 cursor-pointer',
              active ? 'bg-gray-100' : '',{'border-b border-gray-200': idx < filtered.length - 1}
            ]"
          >
            <input
              v-if="multiple"
              type="checkbox"
              :checked="isSelected(item)"
              class="form-checkbox h-4 w-4 text-blue-600"
            />
            <span>{{ getLabel(item) }}</span>
          </div>
        </template>
      </MenuItem>
    </MenuItems>
  </Menu>
</template>
