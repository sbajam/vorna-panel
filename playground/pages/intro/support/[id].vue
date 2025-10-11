<script setup>
const { data, request, pending } = useApi();
const { $notifyDanger } = useNuxtApp();
let ticketMessage = ref([]);
const initialValues = reactive({
  text: "", // متن پیام
  file: null, // فایل اختیاری
});
let text = ref("");
let title = ref("");
let fileRef = ref(null);
let isGet = ref(true);
let fd = new FormData();
const config = reactive({
  formProps: {
    title: "",
    columns: { base: 1, md: 1 },
    disabledAll: false,
    loading: true, // اول اسکلتی نشون بده
    loadingMode: "skeleton",
    showErrorsAs: "inline",
  },
  sections: [
    {
      title: "",
      collapsible: false,
      fields: [
        // متن پیام
        {
          key: "text",
          type: "textarea", // اگر بخوای ادیتور داشته باشی: type: "richtext"
          label: "متن پیام :",
          placeholder: "",
          validators: [
            { type: "required", message: "متن پیام الزامی است." },
            {
              type: "minLength",
              value: 3,
              message: "حداقل ۳ کاراکتر وارد کنید.",
            },
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

///////////////////////////////////////////////////////////
async function fetchData() {
  config.formProps.loading = true;
  try {
    await request(`tickets/${useRoute().params.id}`);
    if (data.value.status) {
      ticketMessage.value = data.value.body;
    } else $notifyDanger(data.value.message);
  } catch (e) {
    $notifyDanger("مشکلی در ارتباط با سرور پیش آمد.");
  } finally {
    config.formProps.loading = false;
  }
}
async function submitForm() {
  fd = new FormData();
  fd.append("title", data.value.title);
  fd.append("answeredTo", useRoute().params.id);
  fd.append("text", text.value);
  fd.append("files", fileRef.value);
  config.formProps.loading = true;
  try {
    await request(`tickets/${useRoute().params.id}`, {
      method: "post",
      body: fd,
    });
  } catch (err) {
  } finally {
    config.formProps.loading = false;
  }
  // isGet.value = true;
  // fd = new FormData();
  // fd.append("title", data.value.title);
  // fd.append("answeredTo", useRoute().params.id);
  // fd.append("text", text.value);
  // fd.append("files", fileRef.value);
  // axios({
  //   method: "post",
  //   url: `${baseUrl}/lawyers/tickets`,
  //   data: fd,
  //   headers: {
  //     "Cache-Control": "no-cache",
  //     cookies: useCookie("lawyer").value,
  //   },
  // })
  //   .then(async function (response) {
  //     await Swal.fire({
  //       icon: response.data.status ? "success" : "error",
  //       text: response.data.message,
  //       showConfirmButton: false,
  //       timer: 2000,
  //     });
  //     if (response.data.status) {
  //       text.value = "";
  //       fileRef.value = null;
  //       get();
  //     }
  //   })
  //   .catch(function (error) {
  //     Swal.fire({
  //       icon: "error",
  //       text: "مشکلی در ارتباط با سرور پیش آمد.",
  //       showConfirmButton: false,
  //       timer: 2000,
  //     });
  //   })
  //   .finally(() => {
  //     isGet.value = false;
  //   });
}

onBeforeMount(() => {
  // TODO;
  setTimeout(() => {
    config.formProps.loading = false;
    loading.value = false;
  }, 350);
  fetchData();
});
///////////////////////////////////////////////////////////
</script>
<template>
  <NuxtLayout name="admin"
    ><template #main>
      <Box>
        <div class="grid grid-cols-2 gap-6">
          <div class="flex flex-col gap-2 text-lg col-span-2">
            <div class="text-gray-300">موضوع:</div>
            <div class="text-gray-600 font-bold">{{ data.title }}</div>
          </div>
          <div class="flex flex-col gap-2 text-lg">
            <div class="text-gray-300">زمان ارسال:</div>
            <div class="text-gray-600 font-bold">{{ data.date }}</div>
          </div>
        </div>
      </Box>
      <Box class="mt-6">
        <div
          class="flex items-center justify-between gap-4 text-gray-300 font-bold"
        >
          <div class="flex items-center gap-2">
            <Icon name="fa6-solid:comment" /> پیام ها
          </div>
          <!-- <div class="">1403/2/5</div> -->
        </div>
        <div class="h-0.5 w-full bg-gray-200 rounded-full my-4"></div>

        <div class="flex flex-col gap-4 mt-6">
          <div class="sent">
            <div class="sender">شما</div>
            <p>
              {{ data.text }}
            </p>
            <a v-if="data.file" :href="`${baseUrl}/${data.file}`">فایل</a>
            <div class="time">{{ data.date }}</div>
          </div>
          <!-- others  -->
          <div
            v-for="i in data.answer"
            :class="i.fullName == 'Admin' ? 'delivery' : 'sent'"
          >
            <div v-if="i.fullName != 'Admin'" class="sender">وکیلین</div>
            <div v-else class="sender">شما</div>
            <p>
              {{ i.text }}
            </p>
            <a v-if="i.file" :href="`${baseUrl}/${i.file}`">فایل</a>
            <div class="time">{{ i.date }}</div>
          </div>
        </div>
        <FormBuilder
          class="mt-8 border-t-2 py-4 border-primary-100"
          :config="config"
          :initialValues="initialValues"
          @submitForm="submitForm"
        /> </Box></template
  ></NuxtLayout>
</template>
