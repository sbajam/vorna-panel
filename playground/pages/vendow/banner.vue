<script setup>
import {baseUrl} from '~/config'
let fileRef = ref(null);
let link = ref('');
let banners = ref([]);
let fd = new FormData();
const { request, data, pending } = useApi();
////////////////////////////////////////////////////////////////////////////////////////////////////////
//get
async function fetchData() {
  await request("slider");
  if (data.value.status) banners.value = data.value.body;
  else useNuxtApp().$notifyDanger(data.value.message);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////
//submit
const submit = async () => {
  if (fileRef.value == null) {
    return useNuxtApp().$notifyDanger("لطفا عکس را وارد کنید.");
  }
  fd.append("link", link.value);
  fd.append(
    "image", fileRef.value
  );
  await request("slider", { method: "post", data: fd });
   if (data.value.status) {
    useNuxtApp().$notifySuccess(data.value.message);
    fetchData();
    fileRef.value=null;
    link.value=''
  } else useNuxtApp().$notifyDanger(data.value.message);
};
/////////////////////////////////////////////////////////////////////////////////////////////////////
//delete
const trash = async (id) => {
  await request(`slider/${id}`, { method: "delete" });
  if (data.value.status) {
    useNuxtApp().$notifySuccess(data.value.message);
    fetchData();
  } else useNuxtApp().$notifyDanger(data.value.message);
};
onBeforeMount(fetchData);
</script>
<template>
  <NuxtLayout name="admin">
    <template #main>
      <div class="flex flex-col lg:flex-nowrap gap-8 w-full">
        <Box>
          <Header>اضافه کردن بنر</Header>
          <div class="grid lg:grid-cols-2 items-center gap-8 justify-center">
            <ImageUploader
              v-model:images="fileRef"
              :multiple="false"
              aspect-ratio="2/1"
              :max-files="1"
              class="max-w-[300px] !pr-8"
            />
            <div class="text-primary-100 text-base font-bold text-justify">
              <div class="mt-2 text-primary-100">
                <span class="text-secondary-100">راهنما:</span> برای بارگذاری بنر
              </div>
              <div class="text-gray-800 font-normal">
                نسبت تصویر برای نمایش در موبایل :
                <span class="text-secondary-100 font-bold">2:1 </span>
                <br />
                نسبت تصویر برای نمایش در سیستم :
                <span class="text-secondary-100 font-bold"> 24:5</span>
                <br />
                در صورتی که نسبت تصویر شما با نسبت های ذکر شده همخوانی نداشته
                باشد، تصویر به صورت خودکار
                <span class="text-secondary-100 font-bold">برش</span> داده می شود.
              </div>
            </div>
            <div class="input-div">
              <InputField
                type="text"
                name="link"
                id="link"
                v-model="link"
                placeholder="لینک بنر"
              />
            </div>

            <Button
              @click="submit()"
              variant="solid"
              color="secondary-100"
              rounded="lg"
              size="lg"
            >
              ثبت
            </Button>
          </div>
        </Box>
        <Box v-show="pending">
          <Spinner height="20vh" />
        </Box>
        <Box
          v-show="!pending"
          class="grid grid-cols-1 md:flex flex-wrap justify-between"
        >
          <div
            v-if="banners.length == 0"
            class="w-full text-center mx-auto md:text-2xl text-primary-100 translate-y-[40%] font-bold"
          >
            بنری برای نمایش موجود نیست.
          </div>
          <div v-else v-for="i in banners" class="">
            <div
              class="h-[120px] xl:h-[100px] mx-auto md:mx-0 overflow-hidden w-auto aspect-[2/1] shadow rounded-xl"
            >
              <img
                :src="`${baseUrl}${i.image}`"
                class="object-cover w-full h-full block"
                alt=""
              />
            </div>
            <a
              :href="i.link"
              targetedit
              class="text-center mx-auto mt-2 block cursor-pointer text-secondary-100 text-xs border-b border-secondary-100"
              >{{ i.link }}</a
            >
            <Icon
              @click="trash(i.id)"
              name="fa6-solid:trash-can"
              class="text-rose-800 text-xl text-center mx-auto w-full mt-4 mb-6 cursor-pointer"
            />
          </div>
        </Box>
      </div>
      <p
        class="md:text-xl px-4 text-justify mb-2 mt-6 md:mt-0 font-bold text-primary-100"
      >
        جهت سفارش طراحی بنر تبلیغاتی اختصاصی با شماره تماس
        <a
          href="tel:09179099185"
          class="border-b border-solid border-secondary-100 text-secondary-100"
          >09179099185</a
        >
        تماس بگیرید
      </p>
    </template>
  </NuxtLayout>
</template>
