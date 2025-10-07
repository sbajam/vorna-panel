<!-- pages/product/add.vue -->
<script setup>
const { request, pending, data } = useApi();
const { $notify, $notifyDanger } = useNuxtApp();

// ======== State ========
const loading = ref(true); // Skeleton
const nameIsGet = ref(false); // اسپینر دکمه اسلاگ
const textIsGet = ref(false); // اسپینر دکمه سئو

const categoriesItem = ref([]); // [{id,name}]
const filePreviews = ref([]); // Blob URLs
const fileNames = ref([]); // ["img1.jpg", ...]

const imageCards = computed(() =>
  filePreviews.value.map((src, i) => ({ name: fileNames.value[i], src }))
);

const form = reactive({
  // اطلاعات اصلی
  name: "",
  nameInLatin: "",
  offer: 0,
  category: null, // v-model DropDown: { id, name }

  newest: false,
  specialOffer: false,
  call: false,

  // مشخصات آزاد
  options: [], // [{name,value}]
  description: "",

  // نوع انتخاب
  attributeType: "options", // "options" | "none"
  attributeName: "",

  // آیتم‌های انتخاب
  attributeValues: [
    {
      name: "",
      price: null,
      capacity: null,
      color: "#ffffff",
      imageName: null,
    },
  ],

  // حالت بدون انتخاب
  singleCapacity: null,
  singlePrice: null,

  // تصاویر
  images: [],
});

// ======== Validation (دستی) ========
const errors = reactive({
  name: "",
  nameInLatin: "",
  offer: "",
  category: "",
  description: "",
  options: [], // هم‌اندازه با form.options
  attributeName: "",
  attributeValues: [], // هم‌اندازه با form.attributeValues
  singleCapacity: "",
  singlePrice: "",
  images: "",
});

function clearErrors() {
  errors.name = "";
  errors.nameInLatin = "";
  errors.offer = "";
  errors.category = "";
  errors.description = "";
  errors.options = form.options.map(() => ({ name: "", value: "" }));
  errors.attributeName = "";
  errors.attributeValues = form.attributeValues.map(() => ({
    name: "",
    price: "",
    capacity: "",
  }));
  errors.singleCapacity = "";
  errors.singlePrice = "";
  errors.images = "";
}

const v_required = (val) =>
  !(
    val === null ||
    val === undefined ||
    (typeof val === "string" && val.trim() === "") ||
    (Array.isArray(val) && val.length === 0)
  );
const v_maxLen = (val, n) => (val || "").trim().length <= n;
const v_minLen = (val, n) => (val || "").trim().length >= n;
const v_between = (val, min, max) =>
  typeof val === "number" && val >= min && val <= max;

function validateField(key) {
  switch (key) {
    case "name":
      errors.name = !v_minLen(form.name, 2)
        ? "حداقل ۲ کاراکتر."
        : !v_maxLen(form.name, 255)
        ? "حداکثر ۲۵۵ کاراکتر."
        : "";
      break;
    case "nameInLatin":
      errors.nameInLatin = !v_maxLen(form.nameInLatin, 255)
        ? "حداکثر ۲۵۵ کاراکتر."
        : "";
      break;
    case "offer":
      errors.offer = form.call
        ? ""
        : !v_between(Number(form.offer || 0), 0, 100)
        ? "بازه معتبر ۰ تا ۱۰۰."
        : "";
      break;
    case "category":
      errors.category = !form.category ? "انتخاب دسته‌بندی الزامی است." : "";
      break;
    case "description":
      errors.description = !v_minLen(form.description, 2)
        ? "حداقل ۲ کاراکتر."
        : "";
      break;
    case "singleCapacity":
      if (form.attributeType !== "options")
        errors.singleCapacity =
          !v_required(form.singleCapacity) || Number(form.singleCapacity) < 0
            ? "موجودی معتبر وارد کنید."
            : "";
      break;
    case "singlePrice":
      if (form.attributeType !== "options" && !form.call)
        errors.singlePrice = form.singlePrice == null ? "قیمت لازم است." : "";
      break;
    case "images":
      errors.images = !(form.images && form.images.length)
        ? "حداقل یک تصویر لازم است."
        : "";
      break;
  }
}

function validateAll() {
  clearErrors();

  validateField("name");
  validateField("nameInLatin");
  validateField("offer");
  validateField("category");
  validateField("description");
  validateField("images");

  // مشخصات آزاد
  errors.options = form.options.map((o) => ({
    name: !v_required(o?.name) ? "عنوان لازم است." : "",
    value: !v_required(o?.value) ? "مقدار لازم است." : "",
  }));

  if (form.attributeType === "options") {
    errors.attributeName = !v_required(form.attributeName)
      ? "عنوان انتخاب لازم است."
      : "";
    errors.attributeValues = form.attributeValues.map((row) => {
      const rowErr = { name: "", price: "", capacity: "" };
      rowErr.name = !v_required(row.name) ? "نام انتخاب لازم است." : "";
      rowErr.capacity = !v_required(row.capacity) ? "موجودی لازم است." : "";
      if (!form.call)
        rowErr.price =
          row.price == null || row.price === "" ? "قیمت لازم است." : "";
      return rowErr;
    });
  } else {
    validateField("singleCapacity");
    validateField("singlePrice");
  }

  const any =
    errors.name ||
    errors.nameInLatin ||
    errors.offer ||
    errors.category ||
    errors.description ||
    errors.images ||
    errors.options.some((r) => r.name || r.value) ||
    (form.attributeType === "options"
      ? errors.attributeName ||
        errors.attributeValues.some((r) => r.name || r.price || r.capacity)
      : errors.singleCapacity || errors.singlePrice);

  return !any;
}

// ======== Fetch categories ========
async function fetchCategories() {
  try {
    await request("categories");
    if (data.value?.status) {
      const raw = data.value.body || [];
      const flat = [];
      raw.forEach((item) => {
        if (!item.subs || item.subs.length === 0)
          flat.push({ id: item.id, name: item.name });
        else
          item.subs.forEach((sub) => flat.push({ id: sub.id, name: sub.name }));
      });
      categoriesItem.value = flat;
    } else {
      $notify(data.value?.message || "خطا در دریافت دسته‌بندی", "info");
    }
  } catch (e) {
    $notifyDanger("مشکلی پیش آمد");
  } finally {
    loading.value = false;
  }
}
onBeforeMount(fetchCategories);

// ======== Helpers ========
function addSpec() {
  form.options.push({ name: "", value: "" });
  errors.options.push({ name: "", value: "" });
}
function removeSpec(i) {
  form.options.splice(i, 1);
  errors.options.splice(i, 1);
}

function addAttr() {
  form.attributeValues.push({
    name: "",
    price: null,
    capacity: null,
    color: "#ffffff",
    imageName: null,
  });
  errors.attributeValues.push({ name: "", price: "", capacity: "" });
}
function removeAttr(i) {
  form.attributeValues.splice(i, 1);
  errors.attributeValues.splice(i, 1);
}

// ======== Images ========
watch(
  () => form.images,
  (files) => {
    const arr = Array.isArray(files) ? files : files ? [files] : [];
    fileNames.value = arr.map((f) => f.name || "");
    filePreviews.value.forEach((url) => URL.revokeObjectURL(url));
    filePreviews.value = arr.map((f) => URL.createObjectURL(f));
    form.attributeValues.forEach((a) => {
      if (a.imageName && !fileNames.value.includes(a.imageName))
        a.imageName = null;
    });
  },
  { deep: true }
);

// ======== AI fallbacks ========
function basicSlugify(str) {
  return (str || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\u0600-\u06FF]+/g, "") // ساده
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
async function generateSlug() {
  if ((form.name || "").trim().length < 4) return;
  nameIsGet.value = true;
  try {
    form.nameInLatin = basicSlugify(form.name);
  } finally {
    nameIsGet.value = false;
  }
}
async function generateSEO() {
  if ((form.name || "").trim().length < 4) return;
  textIsGet.value = true;
  try {
    const catName = form.category?.name || "-";
    form.description = `
      <p><strong>${
        form.name
      }</strong> در دسته "${catName}" با ویژگی‌های زیر:</p>
      <ul>
        ${form.options
          .map((o) => `<li><strong>${o.name}:</strong> ${o.value}</li>`)
          .join("")}
      </ul>
      <p>توضیحات تکمیلی محصول را اینجا کامل کنید.</p>
    `
      .replace(/\s+/g, " ")
      .trim();
  } finally {
    textIsGet.value = false;
  }
}

// ======== Submit ========
async function onSubmit() {
  if (!validateAll()) {
    $notify("لطفاً خطاهای فرم را برطرف کنید.", "danger");
    return;
  }

  const fd = new FormData();
  fd.append("name", form.name);
  fd.append("nameInLatin", (form.nameInLatin || "").replace(/\s+/g, "-"));
  fd.append("newest", form.newest);
  fd.append("specialOffer", form.specialOffer);

  // قیمت نهایی
  let finalPrice = 0;
  if (!form.call) {
    if (form.attributeType === "options") {
      const prices = (form.attributeValues || []).map((i) =>
        i.price != null ? +i.price : Infinity
      );
      finalPrice = Math.min(...prices);
    } else {
      finalPrice = form.singlePrice ? +form.singlePrice : 0;
    }
  }
  fd.append("price", form.call ? 0 : finalPrice.toString());
  fd.append("offer", form.call ? 0 : +(form.offer || 0));
  fd.append("description", form.description || "");
  fd.append(
    "categories",
    JSON.stringify(form.category?.id ? [form.category.id] : [])
  );
  fd.append("options", JSON.stringify(form.options || []));

  const attributePayload =
    form.attributeType === "none"
      ? {
          name: "default",
          value: [
            {
              name: "",
              color: "#ffffff",
              capacity: form.singleCapacity || 0,
              price: form.call ? 0 : form.singlePrice || 0,
            },
          ],
        }
      : {
          name: (form.attributeName || "default").trim(),
          value: (form.attributeValues || []).map((i) => ({
            name: i.name || "",
            color: i.color || "#ffffff",
            capacity: i.capacity || 0,
            price: form.call ? 0 : i.price || 0,
            imageName: i.imageName || null,
          })),
        };
  fd.append("attribute", JSON.stringify(attributePayload));

  (form.images || []).forEach((f) => fd.append("images", f));

  try {
    const res = await request("products", { method: "post", body: fd });
    $notify(
      res?.value?.message || "انجام شد",
      res?.value?.status ? "success" : "danger"
    );
    if (res?.value?.status) navigateTo("../../product");
  } catch (e) {
    $notifyDanger("مشکلی پیش آمد");
  }
}
</script>

<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box>
        <!-- هدر + دکمه‌های AI (همیشه بالا) -->
        <div class="flex items-center justify-between mb-4">
          <Header>اضافه کردن محصول</Header>
          <div class="flex gap-2 items-center">
            <Button
              size="sm"
              variant="solid"
              color="gray-200"
              @click="generateSlug"
              :loading="nameIsGet"
            >
              ترجمه با هوش مصنوعی
            </Button>
            <Button
              size="sm"
              variant="solid"
              color="gray-200"
              @click="generateSEO"
              :loading="textIsGet"
            >
              تولید توضیحات سئو
            </Button>
          </div>
        </div>

        <!-- Skeleton -->
        <div v-if="loading" class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div
            class="h-24 bg-gray-200 rounded animate-pulse md:col-span-2"
          ></div>
          <div
            class="h-24 bg-gray-200 rounded animate-pulse md:col-span-2"
          ></div>
          <div
            class="h-24 bg-gray-200 rounded animate-pulse md:col-span-2"
          ></div>
        </div>

        <div v-else class="flex flex-wrap gap-4 mt-8 justify-between">
          <!-- نام محصول -->

          <InputField
            v-model="form.name"
            name="name"
            label="نام محصول :"
            placeholder=""
            :errorMessage="errors.name"
            @blur="validateField('name')"
          />

          <!-- نام لاتین + دکمه اسلاگ داخل اینپوت مثل اصلی -->

          <InputField
            v-model="form.nameInLatin"
            name="nameInLatin"
            label="نام لاتین :"
            placeholder=""
            :errorMessage="errors.nameInLatin"
            @blur="validateField('nameInLatin')"
          />

          <!-- درصد تخفیف -->

          <InputField
            v-model.number="form.offer"
            type="number"
            name="offer"
            label="درصد تخفیف :"
            placeholder="0 تا 100"
            :errorMessage="errors.offer"
            @blur="validateField('offer')"
          />

          <!-- دسته‌بندی -->
          <DropDown
            v-model="form.category"
            :items="categoriesItem"
            label="دسته بندی :"
            :errorMessage="errors.category"
          />

          <!-- تگ‌ها (با ToggleSwitch خودت) -->
<div class="flex flex-col md:flex-row md:items-center gap-x-8 gap-y-4">
          <ToggleSwitch v-model="form.newest" name="newest" label="جدید" />
          <ToggleSwitch
            v-model="form.specialOffer"
            name="specialOffer"
            label="پیشنهاد شگفت انگیز"
          />
          <ToggleSwitch
            v-model="form.call"
            name="call"
            label="برای قیمت کالا تماس بگیرند"
            @update:modelValue="
              () => {
                errors.offer = '';
              }
            "
          />
          </div>

          <!-- مشخصات آزاد -->
          <div class="flex flex-col w-full !items-start">
            <div
              class="flex gap-4 mb-4 items-center w-full mt-6 text-secondary-100"
            >
              <span>مشخصات :</span>
              <Button
                size="xs"
                variant="solid"
                color="secondary-100"
                rounded="full"
                @click="addSpec"
                icon="fa6-solid:plus"
              ></Button>
            </div>

            <div
              v-for="(option, index) in form.options"
              :key="'opt-' + index"
              class="flex flex-wrap md:flex-nowrap w-full gap-1 md:gap-4 items-center"
            >
              <Button
                size="xs"
                variant="solid"
                color="red-500"
                rounded="full"
                @click="removeSpec(index)"
                icon="fa6-solid:minus"
              ></Button>

              <InputField
                v-model="option.name"
                :name="`option${index}N`"
                label="عنوان :"
                type="text"
                placeholder=""
                :errorMessage="errors.options?.[index]?.name"
                @blur="
                  () => {
                    errors.options[index].name = !v_required(option.name)
                      ? 'عنوان لازم است.'
                      : '';
                  }
                "
              />

              <InputField
                v-model="option.value"
                :name="`option${index}V`"
                label="مقدار :"
                type="text"
                placeholder=""
                :errorMessage="errors.options?.[index]?.value"
                @blur="
                  () => {
                    errors.options[index].value = !v_required(option.value)
                      ? 'مقدار لازم است.'
                      : '';
                  }
                "
              />
            </div>
          </div>

          <!-- توضیحات + دکمه سئو بالا سمت راست بخش -->
          <div class="input-div box-1 !w-full !flex-wrap">
            <div class="w-full flex items-center gap-6 justify-between">
              <span class="font-semibold text-secondary-100">توضیحات :</span>
            </div>
            <Editor
              class="add"
              placeholder=""
              name="description"
              v-model="form.description"
            />
            <p v-if="errors.description" class="text-red-800 text-sm mt-1">
              {{ errors.description }}
            </p>
          </div>

          <!-- جداکننده -->
          <div class="w-full bg-primary-100 h-1 rounded-xl my-8 mx-auto"></div>

          <!-- نوع انتخاب: دو دکمه انتخابی با Button (نه رادیو) -->
          <div class="grid md:grid-cols-2 gap-4 w-full">
            <Button
              :variant="form.attributeType === 'none' ? 'solid' : 'outline'"
              color="secondary-100"
              class="w-full md:w-auto"
              @click="form.attributeType = 'none'"
              :full-width="true"
            >
              بدون انتخاب
            </Button>
            <Button
              :variant="form.attributeType === 'options' ? 'solid' : 'outline'"
              color="secondary-100"
              class="w-full md:w-auto"
              @click="form.attributeType = 'options'"
              :full-width="true"
            >
              دارای انتخاب <br /><span class="text-xs">(رنگ / سایز)</span>
            </Button>
          </div>

          <!-- وقتی دارای انتخاب -->
          <div
            v-if="form.attributeType === 'options'"
            class="flex flex-col w-full !items-start"
          >
            <div
              class="flex text-lg flex-wrap md:flex-nowrap gap-4 mb-4 items-center w-full mt-6 text-secondary-100"
            >
              <span>گزینه‌ها :</span>
              <Button
                size="xs"
                variant="solid"
                color="secondary-100"
                class="!rounded-full !px-3"
                @click="addAttr"
                >+</Button
              >
              <span class="text-primary-100 w-full md:w-fit text-sm">
                اگر انتخاب‌های شما رنگ هستند رنگ را انتخاب کنید، در غیر این صورت
                سفید بگذارید.
              </span>
            </div>

            <InputField
              type="text"
              v-model="form.attributeName"
              label=" عنوان انتخاب :"
              placeholder="مثلاً رنگ"
              :errorMessage="errors.attributeName"
              @blur="
                () => {
                  errors.attributeName = !v_required(form.attributeName)
                    ? 'عنوان انتخاب لازم است.'
                    : '';
                }
              "
            />

            <div
              v-for="(a, index) in form.attributeValues"
              :key="'attr-' + index"
              class="grid grid-cols-1 md:grid-cols-3 md:items-center w-full gap-1 md:gap-4 my-8 md:my-2 border rounded-xl p-4 md:p-0 md:border-none"
            >
              <div class="flex items-center gap-1">
                <Button
                  size="xs"
                  color="red-500"
                  rounded="full"
                  @click="removeSpec(index)"
                  icon="fa6-solid:minus"
                ></Button>
                <InputField
                  v-model="a.name"
                  :name="`${index}N`"
                  label="انتخاب :"
                  type="text"
                  placeholder="قرمز"
                  :errorMessage="errors.attributeValues?.[index]?.name"
                  @blur="
                    () => {
                      errors.attributeValues[index].name = !v_required(a.name)
                        ? 'نام انتخاب لازم است.'
                        : '';
                    }
                  "
                />
              </div>
              <InputField
                v-model.number="a.price"
                :name="`${index}price`"
                label="قیمت :"
                type="number"
                placeholder="100,000"
                :errorMessage="errors.attributeValues?.[index]?.price"
                @blur="
                  () => {
                    errors.attributeValues[index].price =
                      a.price == null || a.price === '' ? 'قیمت لازم است.' : '';
                  }
                "
              />

              <InputField
                v-model.number="a.capacity"
                :name="`${index}C`"
                label="موجودی :"
                type="number"
                placeholder="5"
                :errorMessage="errors.attributeValues?.[index]?.capacity"
                @blur="
                  () => {
                    errors.attributeValues[index].capacity = !v_required(
                      a.capacity
                    )
                      ? 'موجودی لازم است.'
                      : '';
                  }
                "
              />
              <div class="mt-2">
                <input
                  type="color"
                  class="outline-none rounded-full h-[50px] w-[50px] aspect-square"
                  v-model="a.color"
                />
              </div>
            </div>

            <!-- کارت‌های انتخاب عکس مرتبط -->
            <div
              v-if="imageCards.length"
              class="flex flex-wrap gap-2 col-span-3"
            >
              <span class="text-sm text-gray-600 w-full font-bold"
                >انتخاب عکس مرتبط:</span
              >
              <div class="w-full">
                <ImageP v-model="a.imageName" :images="imageCards" />
              </div>
            </div>
          </div>

          <!-- وقتی بدون انتخاب -->
          <div v-if="form.attributeType !== 'options'" class="w-full flex flex-col gap-4">
            <InputField
              type="number"
              name="singleCapacity"
              v-model.number="form.singleCapacity"
              label="موجودی محصول :"
              placeholder="مثلاً 10"
              :errorMessage="errors.singleCapacity"
              @blur="validateField('singleCapacity')"
            />
            <InputField
              type="number"
              name="price"
              v-model.number="form.singlePrice"
              label="قیمت محصول :"
              placeholder="100,000"
              :errorMessage="errors.singlePrice"
              @blur="validateField('singlePrice')"
            />
          </div>

          <!-- جداکننده -->
          <div class="w-full bg-primary-100 h-1 rounded-xl my-8 mx-auto"></div>

          <!-- تصاویر -->
          <ImageUploader
            v-model:images="form.images"
            :multiple="true"
            :initial-images="filePreviews"
            aspect-ratio="1/1"
            :max-files="10"
            accept="image/*"
            label="عکس :"
            @change="() => validateField('images')"
          />
          <p v-if="errors.images" class="text-red-800 text-sm mt-2">
            {{ errors.images }}
          </p>

          <!-- دکمه ثبت -->
          <div class="text-left w-full">
            <Button
              @click="onSubmit"
              variant="solid"
              color="primary-100"
              size="lg"
              :loading="pending"
              :full-width="true"
            >
              ثبت
            </Button>
          </div>
        </div>
      </Box>
    </template>
  </NuxtLayout>
</template>

