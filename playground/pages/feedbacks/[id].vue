<script setup>
let text = ref("");
let fullName = ref("");
let replyTo = ref({ id: null, text: "" });
let blogs = ref({ id: 0, name: "" });
let adminApproval = ref("");
let reply = ref("");
const { request, data, pending } = useApi();
////////////////////////////////////////////////////////////////////////////////////////////////////////
async function fetData() {
  await request("blogcomments");
  if (data.value.status) {
    let d = [];
    let tmp = data.value.body;
    for (let i of tmp) {
      d.push(
        ...i.comments.map((e) => ({
          ...e,
          blogName: i.name,
        }))
      );
    }
    let c = d.find((e) => e.id == useRoute().params.id);
    replyTo.value = d.find((e) => e.id == c.replyTo);
    text.value = c.text;
    fullName.value = c.fullName;
    blogs.value = { name: c.blogName, id: c.blogId };
    adminApproval.value = c.adminApproval;
  } else useNuxtApp().$notifyDanger(data.value.message);
}
///////////////////////////////////////////////////////////////////////////////////
// approve
const approve = async (flag) => {
  await request(`blogcomments/${useRoute().params.id}/${flag}`, {
    method: "patch",
    data: {},
  });
  useNuxtApp().$notify(
    data.value.message,
    data.value.status ? "success" : "danger"
  );
  fetData();
};
///////////////////////////////////////////////////////////////////////////////////
// submit
const submit = async () => {
  await request(`blogcomments/${useRoute().params.id}`, {
    method: "post",
    data: { text: reply.value },
  });
  useNuxtApp().$notify(
    data.value.message,
    data.value.status ? "success" : "danger"
  );
  if (data.value.status) useRouter().back();
};

onBeforeMount(fetData);
</script>
<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box>
        <Header>بررسی نظر</Header>
        <Spinner v-show="pending" data-aos="fade-right" height="20vh" />
        <div
          v-if="!pending"
          data-aos="fade-right"
          class="grid w-full grid-cols-1 md:grid-cols-2 gap-8 justify-between items-baseline mt-8"
        >
          <div
            v-if="!adminApproval"
            class="font-bold px-8 py-2 w-full bg-primary-100 text-white md:col-span-2 cursor-default text-lg text-center"
          >
            <font-awesome-icon :icon="['fas', 'clock']" />
            منتظر تایید
          </div>
          <div
            v-if="adminApproval"
            class="font-bold px-8 py-2 w-full bg-primary-100 text-white md:col-span-2 cursor-default text-lg text-center"
          >
            <font-awesome-icon :icon="['fas', 'check']" />
            تایید شده
          </div>
          <div class="input-div box-1 text-xl flex items-center gap-4">
            <label for="title">نویسنده : </label>
            <div class="input">{{ fullName }}</div>
          </div>
          <div class="input-div box-1 text-xl">
            <label for="title">مقاله مربوطه : </label>
            <NuxtLink
              :to="`../../blog/${blogs.id}`"
              class="input text-secondary-100 border-b border-secondary-100"
              >{{ blogs.name }}</NuxtLink
            >
          </div>
          <div v-if="replyTo?.id" class="input-div box-1 text-sm md:col-span-2">
            <label for="title"> پاسخ به : </label>
            <NuxtLink
              :to="`../../feedbacks/${replyTo.id}`"
              class="px-4 w-full py-2 rounded-lg bg-gray-100 !text-gray-600 border !border-gray-600"
              v-html="replyTo.text"
            >
            </NuxtLink>
          </div>

          <div class="input-div mt-6 box-1 md:col-span-2 text-xl">
            <label for="fullText">توضیحات : </label>
            <p class="advance-text input read-only" v-html="text"></p>
          </div>
        </div>
        <div class="text-left">
          <Button
            size="lg"
            rounded="lg"
            color="green-800"
            :pending="pending"
            v-if="!adminApproval"
            @click="approve('approved')"
            class="ml-10 mt-10"
          >
            تایید
          </Button>
          <Button
            size="lg"
            rounded="lg"
            color="rose-800"
            :pending="pending"
            v-if="adminApproval"
            @click="approve('rejected')"
            class="ml-10 mt-10"
          >
            رد
          </Button>
        </div>
      </Box>
      <Box v-if="!replyTo?.id && !pending && adminApproval" class="mt-8 md:mt-8" >
        <Header>پاسخ نظر</Header>

        <Editor v-model="reply" :image="false" class="add"></Editor>
        <Button
          size="lg"
          rounded="lg"
          color="primary-100"
          :pending="pending"
          @click="submit()"
          class="ml-10 mt-10"
        >
          ارسال
        </Button>
      </Box>
    </template>
  </NuxtLayout>
</template>
