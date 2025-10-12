<script setup>
let tickets = ref([]);
const { request, pending, data } = useApi();
const { $notifyDanger } = useNuxtApp();
///////////////////////////////////////////////////////////
async function fetchData() {
  await request("tickets");
  if (data.value.status) {
    tickets.value = data.value.body.sort((b,a)=>a.id-b.id);;
  } else $notifyDanger(data.value.message);
}
onBeforeMount(() => {
  fetchData();
});
///////////////////////////////////////////////////////////
</script>
<template>
  <NuxtLayout name="admin"
    ><template #main>
      <Box class="box flex flex-col gap-6">
        <NuxtLink
          to="../support/add"
          class="text-lg text-center font-bold flex items-center gap-2 justify-center bg-white top-2 left-2 z-[1000000] py-2 px-4 border-2 border-primary-100 rounded-lg text-primary-100"
          ><Icon name="fa6-solid:comment" /> سوال جدید</NuxtLink
        >
        <div class="flex flex-col gap-4 px-4">
          <a href="tel:09179099185" class="flex items-center gap-2">
            <Icon name="fa6-solid:phone" class="text-lg text-secondary-100" />
            تلفن پشتیبانی:
            <span class="font-bold text-primary-100">09179099185</span>
          </a>
          <a href="mailto:info@vendow.ir" class="flex items-center gap-2">
            <Icon name="fa6-solid:at" class="text-lg text-secondary-100" />
            ایمیل پشتیبانی:
            <span class="font-bold text-primary-100"> info@vendow.ir </span>
          </a>
        </div>
      </Box>
      <Box>
        <Header>تیکت های شما</Header>

        <div
          v-if="!tickets.length"
          class="flex flex-col justify-center items-center mt-10 text-xl gap-4 font-bold text-primary-100"
        >
          هنوز تیکتی ثبت نکرده اید.
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TicketCard v-for="i in tickets" :data="i" />
        </div>
      </Box> </template
  ></NuxtLayout>
</template>
