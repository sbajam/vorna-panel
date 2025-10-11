<!-- pages/support/new-ticket-with-formbuilder.vue -->
<script setup lang="ts">

// استیت‌های ساده‌ی صفحه

// مقدارهای اولیه‌ی فرم (هم‌نام با فیلدها)
const initialValues = reactive({
  title: "",   // یکی از آیتم‌ها
  text: "",    // متن پیام
  file: null as File | null, // فایل اختیاری
});

// پُر کردن آیتم‌های انتخاب عنوان
const titleItems = [
  { label: "بخش پشتیبانی", value: "بخش پشتیبانی" },
  { label: "بخش مالی",     value: "بخش مالی" },
  { label: "مشاوره",       value: "مشاوره" },
  { label: "بخش اداری",    value: "بخش اداری" },
  { label: "سایر",         value: "سایر" },
];

// کانفیگ فرم‌بیلدر
const config = reactive({
  formProps: {
    title: "",
    columns: { base: 1, md: 1 },
    disabledAll: false,
    loading: false,                // اول اسکلتی نشون بده
    loadingMode: "skeleton",
    showErrorsAs: "inline",
  },
  sections: [
    {
      title: "",
      collapsible: false,
      fields: [
        // عنوان/دپارتمان
        {
          key: "title",
          type: "select",
          label: "موضوع :",
          items: titleItems,
          labelField: "label",
          valueField: "value",
          searchable: false,
          clearableSelect: false,
          validators: [
            { type: "required", message: "انتخاب موضوع الزامی است." },
          ],
        },

        // متن پیام
        {
          key: "text",
          type: "textarea", // اگر بخوای ادیتور داشته باشی: type: "richtext"
          label: "متن پیام :",
          placeholder: "",
          validators: [
            { type: "required", message: "متن پیام الزامی است." },
            { type: "minLength", value: 3, message: "حداقل ۳ کاراکتر وارد کنید." },
          ],
        },

        // فایل اختیاری
        {
          key: "file",
          type: "file",
          label: "فایل پیوست (اختیاری)",
          multipleFile: false,
          maxFiles: 1,
          accept: "*/*",
          isImageUploader: false, // چون هر نوع فایلی ممکنه
          clearable: true,
        },
      ],
    },
  ],
  submitButton: {
    text: "ثبت پیام",
    variant: "solid",
    color: "primary-100",
    size: "lg",
    pending: false,
    fullWidth: true,
    rounded: "lg",
  },
});

// اسکلتون رو کوتاه نشون می‌دیم که حس لودینگ داشته باشه


// سابمیت
async function submitForm(values: Record<string, any>) {
  // TODO:
  // اگر فرم‌بیلدر خطا داشته باشه، اینجا نمیاد (validators خودش اجرا می‌شن)

  // // تصمیم: اگر فایل انتخاب شده بود → multipart؛ وگرنه JSON (مثل کد اصلی)
  // const hasFile = !!values.file;

  // config.submitButton.pending = true;
  // try {
  //   if (hasFile) {
  //     const fd = new FormData();
  //     fd.append("title", values.title);
  //     fd.append("text", values.text);
  //     fd.append("files", Array.isArray(values.file) ? values.file[0] : values.file);
  //     // اگر API شما به جای 'files' کلید دیگری می‌خواهد، همینجا تغییر بده

  //     const res = await axios({
  //       method: "post",
  //       url: `${baseUrl}/mystore/tickets`,
  //       data: fd,
  //       headers: {
  //         "Cache-Control": "no-cache",
  //         // اگر کوکی لازم دارید:
  //         // cookies: useCookie("mystore").value,
  //       },
  //     });

  //     await (window as any).Swal?.fire?.({
  //       icon: res.data?.status ? "success" : "error",
  //       text: res.data?.message || (res.data?.status ? "با موفقیت ثبت شد" : "ثبت نشد"),
  //       showConfirmButton: false,
  //       timer: 2000,
  //     });

  //     if (res.data?.status) navigateTo("../support");
  //   } else {
  //     const res = await axios({
  //       method: "post",
  //       url: `${baseUrl}/mystore/tickets`,
  //       data: {
  //         title: values.title,
  //         text: values.text,
  //       },
  //       headers: {
  //         "Cache-Control": "no-cache",
  //         // cookies: useCookie("mystore").value,
  //       },
  //     });

  //     await (window as any).Swal?.fire?.({
  //       icon: res.data?.status ? "success" : "error",
  //       text: res.data?.message || (res.data?.status ? "با موفقیت ثبت شد" : "ثبت نشد"),
  //       showConfirmButton: false,
  //       timer: 2000,
  //     });

  //     if (res.data?.status) navigateTo("../support");
  //   }
  // } catch (e) {
  //   (window as any).Swal?.fire?.({
  //     icon: "error",
  //     text: "مشکلی در ارتباط با سرور پیش آمد.",
  //     showConfirmButton: false,
  //     timer: 2000,
  //   });
  // } finally {
  //   config.submitButton.pending = false;
  // }
}
</script>

<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box>
          <Header>درخواست تیکت جدید</Header>

          <!-- فرم‌بیلدر -->
          <FormBuilder
            :config="config"
            :initialValues="initialValues"
            @submitForm="submitForm"
          />
      </Box>
    </template>
  </NuxtLayout>
</template>
