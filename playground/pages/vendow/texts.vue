<script setup>
import { baseUrl } from "../config";
let text = ref("");
let fileRef = ref(null);
let imgSrc = ref(null);
const { request, data, pending } = useApi();
const fetchData = async () => {
  text.value = "";
  imgSrc.value = null;
  await request("about");
  if (data.value.status) {
    text.value = data.value.body.content;
    imgSrc.value = `${baseUrl}/${data.value.body.image}`;
  } else useNuxtApp().$notifyInfo(data.value.message);
};

const submit = async () => {
  let fd = new FormData();
  fd.append("content", text.value);
  fd.append("title", "about");
  fd.append("displayTitle", "درباره ما");
  fd.append(
    "image",
    fileRef.value == null
      ? imgSrc.value == null
        ? null
        : imgSrc.value.includes("null")
        ? null
        : imgSrc.value
      : fileRef.value
  );
  await request("about", {
    method: "post",
    data: fd,
  });
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
      <!-- <Spinner v-if="pending" data-aos="fade-right" height="80vh" /> -->
     
        <Box class="">
          <Header class="">درباره ما</Header>
          <ImageUploader
            v-model:images="fileRef"
            :multiple="false"
            :initial-images="imgSrc"
            aspectRatio="3/2"
            :max-files="1"
            class="!lg:w-4/12"
            infoText="نسبت تصویر 2 : 3 - فرمت های مجاز : Webp, JPEG, PNG, GIF"
            sizeClass="w-6/12 h-auto"
            :watermark="false"
          />
      
            <Editor v-model="text" class="add"></Editor>

            <Button
            class="mt-8"
            size="lg"
            color="primary-100"
            rounded="lg"
            :pending="pending"
            full-width="true"
              @click="submit()"
            >
              ثبت
            </Button>
        </Box>
    </template>
  </NuxtLayout>
</template>
