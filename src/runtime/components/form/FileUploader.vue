<!--
/**
 * @component FileUploader
 * @description A drag-and-drop file upload component with preview support for images
 * 
 * @features
 * 1. Upload Functionality:
 *    - Drag and drop support
 *    - Click to select files
 *    - Multiple file upload support
 *    - File type restrictions
 * 
 * 2. Preview Capabilities:
 *    - Image preview for image files
 *    - File type icons for non-image files
 *    - File name display
 *    - Hover delete functionality
 * 
 * 3. Advanced Features:
 *    - Maximum file count limit
 *    - File size restrictions
 *    - Visual feedback during drag
 *    - File type detection and icons
 *    - Memory management (auto-revoke object URLs)
 * 
 * @example Basic Usage
 * ```vue
 * <FileUploader
 *   v-model:files="uploadedFiles"
 *   accept="image/*"
 * />
 * ```
 * 
 * @example Advanced Configuration
 * ```vue
 * <FileUploader
 *   v-model:files="documents"
 *   accept=".pdf,.doc,.docx"
 *   :multiple="true"
 *   :maxFiles="5"
 *   :maxSize="5000000"
 *   :isImageUploader="false"
 * />
 * ```
 * 
 * @example Image Gallery Mode
 * ```vue
 * <FileUploader
 *   v-model:files="images"
 *   accept="image/jpeg,image/png,image/webp"
 *   :multiple="true"
 *   :isImageUploader="true"
 *   :maxFiles="10"
 * />
 * ```
 */
-->
<template>
  <div
    class="file-uploader"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
  >
    <!-- Dropzone / Upload Button -->
    <div
      class="upload-zone relative flex flex-col items-center justify-center border-2 rounded border-dashed p-6 cursor-pointer bg-white"
      :class="{ 'border-secondary-40 bg-gray-50': dragging }"
      @click="triggerFileInput"
      @drop.prevent="onDrop"
    >
      <Icon name="fa6-solid:cloud-arrow-up" class="text-3xl text-gray-400" />
      <span class="mt-2 text-gray-600">Drop files here or click to upload</span>
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :multiple="multiple"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        @change="onFileChange"
      />
    </div>

    <!-- Preview / File List -->
    <div class="mt-4 flex flex-wrap gap-4">
      <div
        v-for="(item, idx) in items"
        :key="item.id"
        :title="item.name"
        class="file-item group relative w-[100px] h-[100px] bg-gray-50 rounded-xl shadow overflow-hidden"
      >
        <template v-if="isImageUploader && item.previewUrl">
          <img :src="item.previewUrl" class="object-cover w-full h-full" />
        </template>
        <template v-else>
          <div class="flex flex-col items-center justify-center w-full h-full p-4">
            <Icon :name="fileIcon(item.type)" class="text-4xl text-gray-400" />
            <p class="text-xs mt-2 text-center truncate" >{{ item.name }}</p>
          </div>
        </template>
        <button
          @click.stop="removeItem(idx)"
          class="absolute top-2 right-2 bg-red-600 text-white px-2 aspect-square flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition"
          :aria-label="`Delete ${item.name}`"
        >
          <Icon name="fa6-solid:trash-can" class="text-xs" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { nanoid } from 'nanoid'
import type { PropType } from 'vue'

interface UploadedItem {
  id: string
  file: File
  name: string
  size: number
  type: string
  previewUrl?: string
}

const props = defineProps({
  files: {
    type: [File, Array] as PropType<File | File[] | null>,
    default: null
  },
  accept: { type: String, default: '' },
  multiple: { type: Boolean, default: false },
  isImageUploader: { type: Boolean, default: true },
  maxFiles: { type: Number, default: 10 },
  maxSize: { type: Number, default: Infinity }
})

const emit = defineEmits<{
  (e: 'update:files', payload: File | File[] | null): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const items = ref<UploadedItem[]>([])
const dragging = ref(false)

onMounted(() => {
  syncItems(props.files)
})
watch(() => props.files, (val) => syncItems(val))

function syncItems(val: File | File[] | null) {
  items.value.forEach(i => i.previewUrl && URL.revokeObjectURL(i.previewUrl))
  items.value = []
  if (val) {
    const arr = Array.isArray(val) ? val : [val]
    items.value = arr.map(createItem)
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

function createItem(file: File): UploadedItem {
  const item: UploadedItem = {
    id: nanoid(), file, name: file.name, size: file.size, type: file.type
  }
  if (props.isImageUploader && file.type.startsWith('image/')) {
    item.previewUrl = URL.createObjectURL(file)
  }
  return item
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  addFiles(Array.from(input.files))
  input.value = ''
}

function onDragOver() { dragging.value = true }
function onDragLeave() { dragging.value = false }
function onDrop(e: DragEvent) {
  dragging.value = false
  if (e.dataTransfer?.files) addFiles(Array.from(e.dataTransfer.files))
}

function addFiles(filesArr: File[]) {
  filesArr.forEach(f => {
    if (items.value.length >= props.maxFiles) return
    if (f.size > props.maxSize) return
    items.value.push(createItem(f))
  })
  emitCurrent()
}

function removeItem(idx: number) {
  const it = items.value[idx]
  if (it.previewUrl) URL.revokeObjectURL(it.previewUrl)
  items.value.splice(idx, 1)
  emitCurrent()
}

function emitCurrent() {
  const out = items.value.map(i => i.file)
  emit('update:files', props.multiple ? out : out[0] || null)
}

function fileIcon(mime: string) {
  if (/pdf/.test(mime)) return 'fa6-solid:file-pdf'
  if (/word|doc/.test(mime)) return 'fa6-solid:file-word'
  if (/image/.test(mime)) return 'fa6-solid:file-image'
  return 'fa6-solid:file'
}
</script>

<style scoped>
.upload-zone {
  @apply relative transition-colors;
}
.file-item img {
  @apply w-full h-full object-cover;
}
</style>
