<!-- src/runtime/components/ImageP.vue -->
<script setup>
const showModal = ref(true);
const emit = defineEmits(["choose"]);

let image = ref(null);
let name = ref("");
let imageList = ref([]);
const { $notifyDanger, $notifySuccess } = useNuxtApp();
const { pending, request: submitRequest } = useApi();
const { pending: listPending, request: listRequest } = useApi();
const { pending: deletePending, request: deleteRequest } = useApi();

// بارگذاری لیست تصاویر
async function fetchImages() {
  try {
    const response = await listRequest("/images-list", {
      baseUrl: "/api",
      method: "GET",
    });
    if (response.status) {
      imageList.value = response.data.images;
    } else {
      $notifyDanger("خطا در بارگذاری تصاویر.");
    }
  } catch {
    $notifyDanger("خطا در بارگذاری تصاویر.");
  }
}

async function trash(id) {
  try {
    const response = await deleteRequest(`/images-list/${id}`, {
      method: "DELETE",
      baseUrl: "/api",
    });
    if (response?.success) {
      $notifySuccess("تصویر با موفقیت حذف شد.");
      await fetchImages();
    } else {
      $notifyDanger("خطا در حذف تصویر");
    }
  } catch {
    $notifyDanger("خطا در حذف تصویر");
  }
}

// ارسال تصویر جدید
async function submit() {
  if (!image.value) {
    $notifyDanger("لطفا یک تصویر انتخاب کنید");
    return;
  }

  const formData = new FormData();
  formData.append("image", image.value);
  formData.append("title", name.value);

  try {
    const response = await submitRequest("/images-list", {
      method: "post",
      data: formData,
      baseUrl: "/api",
    });

    if (response?.success) {
      $notifySuccess("تصویر با موفقیت ارسال شد.");
      await fetchImages(); // رفرش لیست تصاویر
    } else {
      $notifyDanger(response?.error || "خطا در ارسال تصویر.");
    }
  } catch {
    $notifyDanger("خطا در ارسال تصویر.");
  }
}

// انتخاب یک تصویر و بستن مدال
function choose(url) {
  emit("choose", url);
  showModal.value = false;
}

// بستن مدال
function closeModal() {
  showModal.value = false;
}

onMounted(fetchImages);
</script>

<template>
  <!-- استفاده از layout modal -->
  <NuxtLayout name="modal" :show="showModal" @close_popup="closeModal">
    <!-- تمام محتوای مدال داخل این اسلات -->
    <div class="space-y-6">
      <div class="flex flex-col gap-8 items-center justify-center">
        <ImageUploader
          :multiple="false"
          v-model:images="image"
          class="w-fit rtl justify-start"
        />
        <Button
          :pending="pending"
          @click="submit"
          color="primary-100"
          variant="solid"
          :fullWidth="true"
          size="lg"
        >
          اضافه کردن
        </Button>
      </div>

      <Spinner v-if="listPending" />

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="img in imageList"
          :key="img.id"
          class="relative cursor-pointer"
        >
          <img
            :src="`..${img.url}`"
            class="w-full h-32 object-cover rounded-lg border hover:border-primary-100 transition"
            @click="choose(img.url)"
          />
          <button
            @click="trash(img.id)"
            class="absolute top-2 right-2 text-red-500"
          >
            <Icon name="fa6-solid:trash-can" />
          </button>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
