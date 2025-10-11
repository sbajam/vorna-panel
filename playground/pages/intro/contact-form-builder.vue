<!-- pages/admin/contact-form-builder.vue -->
<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box>
        <!-- هدر -->
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold">سازنده‌ی فرم تماس</h2>

          <div class="flex items-center gap-2">
            <!-- <label class="text-sm">عنوان فرم</label>
            <input
              v-model="formTitle"
              type="text"
              class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100"
              placeholder="مثلاً: فرم تماس صفحهٔ اصلی"
            /> -->
            <Button
              size="lg"
              color="primary-100"
              :pending="saving"
              :disabled="saving"
              @click="saveSchema"
            >
              {{ saving ? "در حال ذخیره…" : "ذخیره" }}
            </Button>
          </div>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <!-- ستون راست: پالت انواع فیلد -->
          <div class="md:col-span-1">
            <h3 class="font-semibold mb-2">افزودن فیلد</h3>
            <div class="space-y-2 p-3 rounded-lg border" v-auto-animate>
              <Button
                :full-width="true"
                color="secondary-100"
                v-for="t in typeItems"
                :key="t.value"
                @click="addField(t.value)"
              >
                {{ t.label }}
              </Button>
            </div>

            <div class="mt-6 text-sm text-gray-600 leading-7">
              <ul class="list-disc pr-4 space-y-1">
                <li>
                  «کلید» هر فیلد خودکار ساخته می‌شود و نمایش داده نمی‌شود.
                </li>
                <li>
                  برای هر فیلد می‌توان «برچسب»، «توضیح»، «اجباری/اختیاری» و
                  «Regex» تعیین کرد.
                </li>
                <li>کارت‌ها را با کشیدن و رها کردن جابه‌جا کن.</li>
              </ul>
            </div>
          </div>

          <!-- ستون چپ: لیست فیلدهای ساخته‌شده -->
          <div class="md:col-span-2">
            <h3 class="font-semibold mb-2">فیلدهای فرم</h3>

            <ul
              class="rounded-lg border p-3 bg-white"
              v-auto-animate
              @dragover.prevent="onDragOver"
              @drop.prevent="onDrop"
            >
              <li
                v-for="(f, i) in fields"
                :key="f.id"
                class="p-3 rounded-lg border bg-white mb-3"
                draggable="true"
                @dragstart="onDragStart(i)"
                @dragend="onDragEnd"
              >
                <!-- هدر کارت: عنوان و اکشن‌ها -->
                <div class="flex items-center justify-between">
                  <div class="text-sm text-gray-500">
                    #{{ i + 1 }} - {{ mapTypeTitle(f.type) }}
                  </div>
                  <div class="flex items-center gap-2">
                    <Button
                      variant="outline"
                      color="red-600"
                      size="sm"
                      @click="removeField(i)"
                    >
                      حذف
                    </Button>
                    <Button
                      variant="outline"
                      color="secondary-100"
                      size="sm"
                      @click="duplicate(i)"
                    >
                      کپی
                    </Button>
                    <Button
                      color="cyan-800"
                      size="sm"
                      icon="fa6-solid:arrow-up"
                      :disabled="i === fields.length - 1"
                      @click="moveUp(i)"
                    >
                    </Button>
                    <!-- <div class="bg-violet-800 bg-cyan-800"></div> -->
                    <Button
                      color="violet-800"
                      size="sm"
                      icon="fa6-solid:arrow-down"
                      :disabled="i === 0"
                      @click="moveDown(i)"
                    >
                    </Button>
                  </div>
                </div>
                <!-- تنظیمات فیلد (فقط HTML ساده) -->
                <div class="grid md:grid-cols-2 gap-4 mt-3">
                  <!-- 1) لیبل (اولین ورودی) -->
                  <InputField
                    v-model="f.label"
                    placeholder="مثلاً: نام و نام خانوادگی"
                    label="برچسب"
                    label-position="top"
                  />
                  <!-- 2) نوع فیلد -->
                  <DropDown
                    v-model="f.type"
                    :items="typeItems"
                    label="نوع"
                    label-position="top"
                  />
                  <CheckBoxGroup
                    v-model="f.required"
                    value="true"
                    label="اجباری باشد"
                    class="md:col-span-2 my-2"
                  />
                  <template v-if="f.type === 'text' || f.type == 'textarea'">
                    <!-- 6) Regex preset -->

                    <DropDown
                      v-model="f.regexPreset"
                      label="Regex از پیش‌فرض‌ها"
                      :options="regexPresetsForType(f.type)"
                      label-position="top"
                      :items="regexPresetsForType(f.type)"
                    />
                    <!-- 7) Regex سفارشی -->

                    <InputField
                      v-model="f.customRegex"
                      placeholder="مثال: ^[0-9]{10}$"
                      label="Regex سفارشی"
                      label-position="top"
                    />
                  </template>
                  <!-- تنظیمات اختصاصی هر نوع -->
                  <template v-if="f.type === 'select'">
                    <div class="md:col-span-2">
                      <div class="flex items-end gap-2">
                        <InputField
                          v-model="newOption"
                          placeholder="مثلاً: فروش"
                          label="گزینه‌های انتخاب"
                          label-position="top"
                        />
                        <Button color="secondary-100" @click="addOption(i)">
                          افزودن
                        </Button>
                      </div>
                      <div class="flex flex-wrap gap-2 mt-3" v-auto-animate>
                        <span
                          v-for="(opt, oi) in f.options"
                          :key="oi"
                          class="px-2 py-1 rounded-lg bg-secondary-100 text-white text-xs flex items-center gap-2"
                        >
                          {{ opt }}
                          <button
                            class="text-white/90"
                            title="حذف"
                            @click="removeOption(i, oi)"
                          >
                            ✕
                          </button>
                        </span>
                      </div>
                    </div>
                  </template>

                  <template v-if="f.type === 'file'">
                    <CheckBoxGroup v-model="f.multiple" label="چندفایل؟" />
                    <InputField
                      v-model="f.accept"
                      type="text"
                      placeholder=" image/*,application/pdf"
                      label="Accept"
                      label-position="top"
                    />
                  </template>
                </div>
              </li>

              <div v-if="!fields.length" class="text-gray-400 text-sm">
                هنوز فیلدی اضافه نشده—از ستون راست یک نوع انتخاب کنید.
              </div>
            </ul>

            <!-- دکمه ذخیره پایین -->
          </div>
        </div>
      </Box>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
/**
 * هیچ import کامپوننتی استفاده نشده؛ فقط عناصر HTML
 * برای انیمیشن‌ها از v-auto-animate (نصب‌شده در پروژه) استفاده می‌شود.
 * رنگ‌ها: فقط primary-100 و secondary-100
 */

type FieldType = "text" | "textarea" | "number" | "select" | "file";
type RegexPreset =
  | "none"
  | "persianLetters"
  | "alpha"
  | "numeric"
  | "email"
  | "mobile"
  | "phone";

definePageMeta({ auth: false });
type BuilderField = {
  id: string;
  key: string; // auto (hidden)
  type: FieldType;
  label: string;
  help: string;
  placeholder?: string;

  required: boolean;
  regexPreset: RegexPreset | null;
  customRegex: string;

  options?: string[]; // select
  multiple?: boolean; // file
  accept?: string; // file
};

const formTitle = ref("فرم تماس");
const saving = ref(false);

const typeItems = [
  { label: "متن", value: "text" },
  { label: "پاراگراف", value: "textarea" },
  { label: "عدد", value: "number" },
  { label: "انتخاب", value: "select" },
  { label: "فایل", value: "file" },
];

const presetOptions: Record<
  Exclude<RegexPreset, "none">,
  { label: string; pattern: string }
> = {
  persianLetters: {
    label: "فقط حروف فارسی",
    pattern: "^[\\u0600-\\u06FF\\s]+$",
  },
  alpha: { label: "فقط حروف انگلیسی", pattern: "^[A-Za-z]+$" },
  numeric: { label: "فقط عدد", pattern: "^\\d+$" },
  email: { label: "ایمیل", pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" },
  mobile: { label: "موبایل ایران", pattern: "^09\\d{9}$" },
  phone: { label: "تلفن ثابت", pattern: "^0[1-9]\\d{7,8}$" },
};

function regexPresetsForType(type: FieldType) {
  const base = [
    { label: "بدون regex", value: "none" },
    { label: presetOptions.persianLetters.label, value: "persianLetters" },
    { label: presetOptions.alpha.label, value: "alpha" },
    { label: presetOptions.numeric.label, value: "numeric" },
  ];
  if (type === "text" || type === "textarea") {
    return [
      ...base,
      { label: presetOptions.email.label, value: "email" },
      { label: presetOptions.mobile.label, value: "mobile" },
      { label: presetOptions.phone.label, value: "phone" },
    ];
  }
  if (type === "number") {
    return base.filter((i) => i.value === "none" || i.value === "numeric");
  }
  return base;
}

const fields = ref<BuilderField[]>([
  mkField("text", "نام و نام خانوادگی", true, "persianLetters"),
  mkField("textarea", "پیام", true, "none"),
  mkField("number", "سن", false, "numeric"),
  { ...mkField("select", "دپارتمان"), options: ["فروش", "پشتیبانی", "مالی"] },
]);

function mkField(
  type: FieldType,
  label = "",
  required = false,
  regexPreset: RegexPreset | null = "none"
): BuilderField {
  return {
    id: uid(),
    key: `fld_${uid()}`,
    type,
    label,
    help: "",
    placeholder: supportsPlaceholder(type) ? "" : undefined,

    required,
    regexPreset,
    customRegex: "",

    options: type === "select" ? [] : undefined,
    multiple: type === "file" ? false : undefined,
    accept: type === "file" ? "" : undefined,
  };
}

function supportsPlaceholder(type: FieldType) {
  return type === "text" || type === "textarea" || type === "number";
}

function mapTypeTitle(t: FieldType) {
  switch (t) {
    case "text":
      return "متن";
    case "textarea":
      return "پاراگراف";
    case "number":
      return "عدد";
    case "select":
      return "انتخاب";
    case "file":
      return "فایل";
  }
}

function addField(type: FieldType) {
  const label = mapTypeTitle(type);
  fields.value.push(mkField(type, label, false, "none"));
}

function removeField(i: number) {
  fields.value.splice(i, 1);
}
function duplicate(i: number) {
  const f = fields.value[i];
  const copy = JSON.parse(JSON.stringify(f)) as BuilderField;
  copy.id = uid();
  copy.key = `fld_${uid()}`;
  fields.value.splice(i + 1, 0, copy);
}

const dragIndex = ref<number | null>(null);
function onDragStart(i: number) {
  dragIndex.value = i;
}
function onDragEnd() {
  dragIndex.value = null;
}
function onDragOver(e: DragEvent) {
  e.preventDefault();
}
function onDrop(e: DragEvent) {
  e.preventDefault();
  const from = dragIndex.value;
  if (from === null) return;
  const container = e.currentTarget as HTMLElement;
  const cards = Array.from(
    container.querySelectorAll('[draggable="true"]')
  ) as HTMLElement[];
  const y = e.clientY;
  let to = cards.findIndex((el) => {
    const r = el.getBoundingClientRect();
    return y < r.top + r.height / 2;
  });
  if (to === -1) to = fields.value.length - 1;
  move(from, to);
  dragIndex.value = null;
}
function move(from: number, to: number) {
  if (from === to) return;
  const item = fields.value.splice(from, 1)[0];
  fields.value.splice(to, 0, item);
}
function moveUp(i: number) {
  if (i > 0) move(i, i - 1);
}
function moveDown(i: number) {
  if (i < fields.value.length - 1) move(i, i + 1);
}

const newOption = ref("");
function addOption(fieldIndex: number) {
  const v = (newOption.value || "").trim();
  if (!v) return;
  const f = fields.value[fieldIndex];
  if (!f.options) f.options = [];
  if (!f.options.includes(v)) f.options.push(v);
  newOption.value = "";
}
function removeOption(fieldIndex: number, optIndex: number) {
  const f = fields.value[fieldIndex];
  if (!f.options) return;
  f.options.splice(optIndex, 1);
}

function buildSchema() {
  return {
    id: slugify(formTitle.value || "contact-form"),
    title: formTitle.value || "فرم تماس",
    version: 1,
    fields: fields.value.map((f) => {
      const validators: Array<{ type: string; pattern?: string }> = [];
      if (f.required) validators.push({ type: "required" });
      if (f.customRegex?.trim()) {
        validators.push({ type: "regex", pattern: f.customRegex.trim() });
      } else if (f.regexPreset && f.regexPreset !== "none") {
        const preset =
          presetOptions[f.regexPreset as Exclude<RegexPreset, "none">];
        if (preset?.pattern)
          validators.push({ type: "regex", pattern: preset.pattern });
      }

      return {
        id: f.id,
        key: f.key,
        type: f.type,
        label: f.label,
        help: f.help || "",
        placeholder: f.placeholder ?? "",
        validators,
        options: f.type === "select" ? f.options || [] : undefined,
        multiple: f.type === "file" ? !!f.multiple : undefined,
        accept: f.type === "file" ? f.accept || "" : undefined,
      };
    }),
  };
}

function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function saveSchema() {
  saving.value = true;
  try {
    const schema = buildSchema();
    // اینجا به API خودت بفرست:
    // const { request } = useApi()
    // await request('contact-forms', { method: 'POST', data: schema })
    console.log("SCHEMA TO SAVE:", schema);
  } finally {
    saving.value = false;
  }
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}
</script>
