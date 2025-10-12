<script setup>
const { request, pending, data } = useApi();
const { $notifyDanger,$notify } = useNuxtApp();
let messages = ref([]);
let newTicket = ref("");

////////////////////////////////////////////////////////////////////////////////////////////////////////
//get
async function get() {
  await request("tickets");
  if (data.value.status) {
    messages.value = data.value.body;
  } else
    $notifyDanger(data.value.message).finally(() => {
      pending.value = false;
    });
}
/////////////////////////////////////////////////////
const send = async () => {
  await request("tickets", { method: "post", data: { text: newTicket.value } });
  $notify(data.value.message, data.value.status ? "success" : "danger");
  if(data.value.status) {
    get();
    newTicket.value=''
  }
};
onMounted(() => {
  get();
});
</script>
<template>
  <NuxtLayout name="admin">
    <template #main>
      <!-- Component Start -->
      <Box class="md:!w-10/12 h-screen flex flex-col flex-grow">
        <Header>پشتیبانی</Header>
        <Spinner v-show="pending" height="50vh" color="secondary-100 " />
        <div
          v-if="!pending"
          class="flex flex-col flex-grow h-0 p-4 overflow-auto pt-20"
        >
          <h2
            v-if="messages.length == 0"
            class="text-primary-100text-xl font-semibold text-center"
          >
            پیامی موجود نیست.
          </h2>
          <div
            v-if="messages.length"
            v-for="message in messages"
            class="message"
            :class="message.store && !message.support ? 'sent' : 'recived'"
          >
            <div>
              <p>{{ message.text }}</p>
            </div>
          </div>
        </div>

        <div
          class="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 gap-4 px-4"
        >
          <a href="tel:09179099185" class="flex items-center gap-2">
            <Icon name="fa6:solid-phone" class="text-lg text-secondary-100 -100" />
            تلفن پشتیبانی:
            <span class="font-bold text-primary">09179099185</span>
          </a>
          <a href="mailto:ft.vorna@gmail.com" class="flex items-center gap-2">
            <Icon name="fa6:solid-at" class="text-lg text-secondary-100 -100" />
            ایمیل پشتیبانی:
            <span class="font-bold text-primary"> ft.vorna@gmail.com </span>
          </a>
        </div>

        <div class="input-div row full">
          <label for="text">متن پیام : </label>
          <textarea
            name="text"
            class="mt-4"
            v-model="newTicket"
            id="text"
          ></textarea>
        </div>

        <Button
          color="primary-100"
          size="lg"
          :pending="pending"
          @click="if (!pending) send();"
          class="mt-4"
          rounded="xl"
          icon="fa:solid-send"
        >
          ثبت پیام
        </Button>
      </Box>

      <!-- Component End  -->
    </template>
  </NuxtLayout>
</template>
<style scoped lang="scss">
.message {
  @apply flex w-full mt-2 space-x-3 max-w-xs;

  &.sent > div {
    @apply bg-[#03367eb3] rounded-l-xl rounded-br-xl text-white p-3;
  }

  &.recived {
    @apply mr-auto justify-end;

    > div {
      @apply bg-[#03367ee4] rounded-r-xl rounded-bl-xl text-gray-100 p-3;
    }
  }

  p {
    @apply text-sm;
  }
}
</style>
