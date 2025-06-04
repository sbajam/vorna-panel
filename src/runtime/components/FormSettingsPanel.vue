<template>
  <div>
    <h3 class="text-lg font-medium mb-4">تنظیمات فرم</h3>
    <div class="space-y-4">
      <!-- Title -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">عنوان فرم</label>
        <input
          type="text"
          v-model="localProps.title"
          @input="emitUpdate"
          class="w-full border rounded px-2 py-1"
        />
      </div>

      <!-- Columns: base و md -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          تعداد ستون‌ها
        </label>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-xs text-gray-600">Base</label>
            <input
              type="number"
              min="1"
              v-model.number="localProps.columns.base"
              @input="emitUpdate"
              class="w-full border rounded px-1 py-0.5"
            />
          </div>
          <div>
            <label class="text-xs text-gray-600">MD</label>
            <input
              type="number"
              min="1"
              v-model.number="localProps.columns.md"
              @input="emitUpdate"
              class="w-full border rounded px-1 py-0.5"
            />
          </div>
        </div>
      </div>

      <!-- Show Errors As -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          نمایش خطاها به صورت
        </label>
        <select
          v-model="localProps.showErrorsAs"
          @change="emitUpdate"
          class="w-full border rounded px-2 py-1"
        >
          <option value="inline">Inline</option>
          <option value="notify">Notify</option>
        </select>
      </div>

      <!-- Disabled All -->
      <div class="flex items-center">
        <input
          type="checkbox"
          id="disabledAll"
          v-model="localProps.disabledAll"
          @change="emitUpdate"
          class="mr-2"
        />
        <label for="disabledAll" class="text-sm font-medium text-gray-700">
          Disabled All
        </label>
      </div>

      <!-- AutoSaveKey -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Auto-Save Key
        </label>
        <input
          type="text"
          v-model="localProps.autoSaveKey"
          @input="emitUpdate"
          placeholder="برای ذخیره خودکار یک کلید وارد کنید"
          class="w-full border rounded px-2 py-1"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineEmits, defineProps } from 'vue'

const emits = defineEmits<{
  (e: 'updateFormProps', props: any): void
}>()

const props = defineProps<{
  initialProps: any
}>()

const localProps = ref({
  title: props.initialProps.title || '',
  columns: {
    base: props.initialProps.columns?.base ?? 1,
    md: props.initialProps.columns?.md ?? 1,
  },
  showErrorsAs: props.initialProps.showErrorsAs || 'inline',
  disabledAll: props.initialProps.disabledAll || false,
  autoSaveKey: props.initialProps.autoSaveKey || '',
})

// سینک با props
watch(
  () => props.initialProps,
  (newP) => {
    localProps.value = {
      title: newP.title || '',
      columns: {
        base: newP.columns?.base ?? 1,
        md: newP.columns?.md ?? 1,
      },
      showErrorsAs: newP.showErrorsAs || 'inline',
      disabledAll: newP.disabledAll || false,
      autoSaveKey: newP.autoSaveKey || '',
    }
  }
)

function emitUpdate() {
  emits('updateFormProps', {
    title: localProps.value.title,
    columns: {
      base: localProps.value.columns.base,
      md: localProps.value.columns.md,
    },
    showErrorsAs: localProps.value.showErrorsAs,
    disabledAll: localProps.value.disabledAll,
    autoSaveKey: localProps.value.autoSaveKey,
  })
}
</script>

<style scoped>
/* استایل دلخواه خود را اضافه کنید */
</style>
