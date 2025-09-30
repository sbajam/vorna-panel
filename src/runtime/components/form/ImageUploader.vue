<template>
  <div
    v-if="!isInitializing"
    class="w-full space-y-4"
    @dragenter.prevent
    @dragover.prevent
    @drop.prevent
  >
    <!-- ===== بخش اطلاعات و قوانین بارگذاری ===== -->
    <div v-if="showInfo" class="flex flex-col flex-wrap gap-4">
      <!-- اگر کاربر slot ویژه info پر نکرده، از prop infoText استفاده شود -->
      <slot name="info">
        <div class="text-sm font-medium text-primary-100">{{ infoText }}</div>
      </slot>
      <label v-if="props.watermark" class="inline-flex items-center gap-x-2">
        <input
          type="checkbox"
          v-model="addWatermark"
          class="h-5 w-5 accent-secondary-100"
        />
        <span class="font-bold text-secondary-100">اضافه کردن واترمارک</span>
      </label>
    </div>
    <!-- ===== پایان بخش اطلاعات ===== -->

    <div class="flex flex-wrap gap-4">
      <!-- دکمهٔ آپلود / نمای پیش‌رو تک‌انتخاب -->
      <label
        :for="inputId"
        :style="`aspect-ratio: ${aspectRatio};`"
        :class="`group relative flex-shrink-0 ${sizeClass}  bg-gray-50 rounded-xl shadow flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-200
        ${
          isDragging
            ? 'border-2 border-dashed border-secondary-100 scale-105'
            : ''
        }`"
        @dragenter.prevent="dragEnter"
        @dragleave.prevent="dragLeave"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        <template v-if="!multiple && previews.length">
          <img
            :src="previews[0]"
            class="object-cover w-full h-full"
            alt="پیش‌نمایش"
          />
          <button
            @click.prevent="removeFile(0)"
            class="absolute top-2 aspect-square flex items-center justify-center right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition"
          >
            <Icon name="fa6-solid:trash-can" class="text-white text-lg" />
          </button>
        </template>
        <template v-else>
          <div class="flex flex-col items-center gap-2 p-4 text-center">
            <Icon name="fa6-solid:plus" class="text-3xl text-secondary-100" />
            <p class="text-sm text-gray-500">
              برای آپلود کلیک کنید یا فایل را بکشید و رها کنید
            </p>
          </div>
        </template>
        <input
          :id="inputId"
          type="file"
          accept="image/webp,image/jpeg,image/png,image/gif"
          class="hidden"
          :multiple="multiple"
          @change="onFileChange"
        />
      </label>

      <!-- نمای پیش‌رو چندانتخاب -->
      <div
        v-if="multiple"
        v-for="(src, idx) in previews"
        :key="idx"
        class="group relative w-[200px] h-[200px] bg-white rounded-xl shadow overflow-hidden"
      >
        <img :src="src" class="object-cover w-full h-full" alt="پیش‌نمایش" />
        <button
          @click="removeFile(idx)"
          class="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition"
        >
          <Icon name="fa6-solid:trash-can" class="text-white text-lg" />
        </button>
      </div>
    </div>
  </div>

  <!-- لودر اولیه -->
  <div v-else class="py-10 flex justify-center">
    <Spinner size="8" borderWidth="2" color="gray-300" />
  </div>
</template>

<script setup>
import { useRuntimeConfig } from "nuxt/app";
import { ref } from "vue";

/**
 * Props:
 * - showInfo      : boolean (default: true)
 *   آیا بلوک قوانین/محدودیت‌ها نمایش داده شود؟
 *
 * - infoText      : string  (default: 'فرمت‌های مجاز: WebP, JPEG, PNG, GIF')
 *   متن پیش‌فرض در بخش info. اگر slot[name="info"] استفاده شود، این نمایش داده نمی‌شود.
 *
 * - multiple      : boolean (default: false)
 *   آیا چندانتخابی است؟
 *
 * - baseUrl       : string  (required)
 *   Base URL برای بارگذاری لوگو در واترمارک.
 *
 * - aspectRatio   : string  (default: '1/1')
 *   نسبت ابعاد ورودی به‌صورت 'عرض/ارتفاع'.
 *
 * - maxFiles      : number  (default: 10)
 *   حداکثر تعداد فایل.
 *
 * - initialImages : string | string[] (default: [])
 *   تصاویر اولیه (یک URL یا آرایه URL).
 *
 * - watermarkImage: string  (default: '')
 *   اگر پر شود، اولویت اول واترمارک تصویر است.
 *
 * - watermarkText : string  (default: '')
 *   اگر watermarkImage پر نبود و این prop پر باشد، متن واترمارک را می‌زنه.
 *
 * Emits:
 * - update:images : (File|File[])
 *   مقدار نهایی فایل‌ها برای v-model.
 *sizeClass: string (default: 'w-[200px]')
 * Slots:
 * - info (optional)
 *   اگر بخواهید بخش قوانین/محدودیت‌ها را با یک المان یا متن سفارشی پر کنید.
 */

// Props اصلی
const props = defineProps({
  showInfo: { type: Boolean, default: true },
  infoText: { type: String, default: "فرمت‌های مجاز: WebP, JPEG, PNG, GIF" },
  multiple: { type: Boolean, default: false },
  baseUrl: { type: String },
  aspectRatio: {
    type: String,
    default: "1/1",
    validator: (v) => /^\d+\/\d+$/.test(v),
  },
  maxFiles: { type: Number, default: 10 },
  initialImages: { type: [Array, String], default: () => [] },
  sizeClass: { type: String, default: "w-[200px]" },
  watermarkImage: { type: String, default: "" },
  watermarkText: { type: String, default: "" },
  watermark: { type: Boolean, default: true },
});
const emit = defineEmits(["update:images"]);

const isInitializing = ref(true);
const files = ref([]);
const previews = ref([]);
const addWatermark = ref(false);
const isDragging = ref(false);
// شناسه تصادفی برای input[type="file"]
const inputId = `img-upl-${Math.random().toString(36).substr(2, 8)}`;

// مقداردهی اولیه
onMounted(() => {
  // debugger
  const init = props.initialImages;
  if (init) {
    const arr = Array.isArray(init) ? init : [init];
    previews.value = arr;
    files.value = arr.map(() => null);
  }
  isInitializing.value = false;
});

// تابع واترمارک‌گذاری (اولویت تصویر، سپس متن، سپس لوگو، سپس اسم فروشگاه)
const watermark = async (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // اولویت با تصویر واترمارک است
      if (props.watermarkImage) {
        addImage(props.watermarkImage);
      }
      // سپس متن واترمارک
      else if (props.watermarkText) {
        drawText(props.watermarkText);
      }
      // در نهایت لوگوی پیش‌فرض
      else {
        const config = useRuntimeConfig();
        if (config.public.vornaPanel?.logo) {
          addImage(config.public.vornaPanel.logo);
        } else if (config.public.vornaPanel?.name) {
          drawText(config.public.vornaPanel.name);
        } else {
          finishImage();
        }
      }

      function addImage(imgSrc) {
        const logo = new Image();
        logo.crossOrigin = "anonymous";
        logo.src = imgSrc;

        logo.onload = () => {
          const logoSize = Math.min(img.width, img.height) * 0.15;
          const padding = Math.max(30, img.width * 0.03);
          const x = img.width - logoSize - padding;
          const y = img.height - logoSize - padding;

          ctx.save();
          ctx.beginPath();
          ctx.arc(
            x + logoSize / 2,
            y + logoSize / 2,
            logoSize / 2,
            0,
            Math.PI * 2,
            true
          );
          ctx.closePath();
          ctx.clip();

          ctx.drawImage(logo, x, y, logoSize, logoSize);
          ctx.restore();
          finishImage();
        };

        logo.onerror = () => finishImage();
      }

      function drawText(text) {
        const fontSize = img.width * 0.05;
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        ctx.lineWidth = fontSize * 0.1;

        const textMetrics = ctx.measureText(text);
        const x = img.width - textMetrics.width - 20;
        const y = img.height - 20;

        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
        finishImage();
      }

      function finishImage() {
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: file.type }));
        }, file.type);
      }
    };

    img.onerror = () => {
      console.error("⛔ تصویر بارگذاری نشد");
      reject(new Error("تصویر بارگذاری نشد"));
    };
  });
};

// فراخوانی وقتی فایل انتخاب شد
async function onFileChange(e) {
  const incoming = Array.from(e.target.files);
  if (!props.multiple) {
    files.value = [];
    previews.value = [];
  }
  for (const f of incoming) {
    if (files.value.length >= props.maxFiles) break;
    let final = f;
    if (addWatermark.value) {
      try {
        final = await watermark(f);
      } catch {
        console.error("⛔ خطا در واترمارک");
      }
    }
    files.value.push(final);
    previews.value.push(URL.createObjectURL(final));
  }
  emitCurrent();
}

// حذف یک فایل
function removeFile(i) {
  files.value.splice(i, 1);
  URL.revokeObjectURL(previews.value[i]);
  previews.value.splice(i, 1);
  emitCurrent();
}

// انتشار مقدار نهایی برای v-model
function emitCurrent() {
  emit("update:images", props.multiple ? files.value : files.value[0] || null);
}

// Event handlers for drag and drop
const dragEnter = (event) => {
  event.preventDefault();
  event.stopPropagation();
  isDragging.value = true;
};

const dragLeave = (event) => {
  event.preventDefault();
  event.stopPropagation();
  isDragging.value = false;
};

const handleDrop = (event) => {
  event.preventDefault();
  event.stopPropagation();
  isDragging.value = false;

  const droppedFiles = event.dataTransfer.files;

  if (droppedFiles && droppedFiles.length > 0) {
    // فیلتر کردن فایل‌های تصویری
    const imageFiles = Array.from(droppedFiles).filter(
      (file) =>
        file.type.startsWith("image/") &&
        ["image/webp", "image/jpeg", "image/png", "image/gif"].includes(
          file.type
        )
    );

    if (imageFiles.length === 0) {
      console.error(
        "⛔ فقط فایل‌های تصویری با فرمت WEBP، JPEG، PNG یا GIF مجاز هستند"
      );
      return;
    }

    // در حالت تک انتخابی، فقط اولین فایل
    if (!props.multiple) {
      const fileList = new DataTransfer();
      fileList.items.add(imageFiles[0]);
      onFileChange({ target: { files: fileList.files } });
    } else {
      // در حالت چند انتخابی، همه فایل‌ها تا سقف مجاز
      const fileList = new DataTransfer();
      imageFiles
        .slice(0, props.maxFiles - files.value.length)
        .forEach((file) => {
          fileList.items.add(file);
        });
      onFileChange({ target: { files: fileList.files } });
    }
  }
};
</script>
