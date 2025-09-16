<script setup>
import { baseUrl } from "~/config";
let fileRef = ref(null);
let brands = ref([]);
let fd = new FormData();
const { request, data, pending } = useApi();
////////////////////////////////////////////////////////////////////////////////////////////////////////
//get
async function fetchdata() {
  await request("brands");
  if (data.value.status) brands.value = data.value.body;
  else useNuxtApp().$notifyInfo(data.value.message);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
//submit
const submit = async () => {
  if (fileRef.value == null) {
    return useNuxtApp().$notifyDanger("لطفا عکس را وارد کنید");
  }
  fd = new FormData();
  fd.append("image", fileRef.value);
  await request("brands", { method: "post", data: fd });

  if (data.value.status) {
    useNuxtApp().$notifySuccess(data.value.message);
    fileRef.value = null;
    fetchdata();
  } else useNuxtApp().$notifyDanger(data.value.message);
};
/////////////////////////////////////////////////////////////////////////////////////////////////////
//delete
const trash = async (id) => {
  await request(`brands/${id}`,{method:'delete'});
  if (data.value.status) {
    useNuxtApp().$notifySuccess(data.value.message);
    fetchdata();
  } else useNuxtApp().$notifyDanger(data.value.message);
};
onBeforeMount(fetchdata)
</script>
<template>
  <NuxtLayout name="admin">
    <template #main>
      <div class="flex flex-wrap lg:flex-nowrap gap-8 w-full">
        <Box class="lg:!w-4/12 h-[fit-content]">
          <Header>اضافه کردن برند</Header>
          <div class="flex flex-col items-center gap-8 justify-center mt-8">
            <ImageUploader
              v-model:images="fileRef"
              :multiple="false"
              aspect-ratio="1/1"
              :max-files="1"
            />
            <Button
              size="lg"
              variant="solid"
              full-width="true"
              color="secondary-100"
              @click="submit()"
            >
              ثبت
            </Button>
          </div>
        </Box>
        <Box v-show="pending">
          <Spinner height="20vh" />
        </Box>
        <Box v-show="!pending" class="flex flex-wrap justify- gap-8">
          <div
            v-if="brands.length == 0"
            class="w-full text-center mx-auto md:text-2xl text-primary translate-y-[40%] font-bold"
          >
            برندی برای نمایش موجود نیست.
          </div>
          <div v-else v-for="i in dbrandsata" class="">
            <div
              class="h-[120px] xl:h-[160px] overflow-hidden w-auto aspect-[1/1] shadow rounded-full"
            >
              <img
                :src="`${baseUrl}${i.image}`"
                class="object-cover w-full h-full block"
                alt=""
              />
            </div>
            <Icon
              @click="trash(i.id)"
              name="fa6-solid:trash-can"
              class="text-secondary text-xl text-center mx-auto w-full mt-4 mb-6 cursor-pointer"
            />
          </div>
        </Box>
      </div>
    </template>
  </NuxtLayout>
</template>
