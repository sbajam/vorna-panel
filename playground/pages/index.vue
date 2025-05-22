<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box>
        <Header>داشبورد</Header>
        <SmartTable
          :data="data"
          :columns="columns"
          delete="products"
          edit="product"
          :idShow="true"
          @refresh="get()"
          excel="true"
          sortable
          class=""
          :actions="[
            {
              emit: 'check',
              icon: 'fa6-solid:check',
              tooltip: 'افزودن محصول جدید',
            },
          ]"
          @check="navigateTo('notify')"
        />
      </Box>
      ll
    </template>
  </NuxtLayout>
</template>
<script setup>
const columns = ref([
  { key: "index", label: "شماره", type: "text" },
  { key: "id", label: "کد محصول", type: "text" },
  { key: "name", label: "نام محصول", type: "text" },
  { key: "price", label: "قیمت", type: "currency" },
]);
let data = ref([
  {
    id: 12,
    name: "سرویس خواب دو نفره الگانس",
    nameInLatin: "servis-khab-do-nafareh-elegans",
    price: 0,
  },
  {
    id: 17,
    name: "سرویس خواب دو طبقه رانزا",
    nameInLatin: "servis-khab-do-tabagheh-ranza",
    price: 0,
  },
  {
    id: 5,
    name: " سرویس خواب نوزاد لیون",
    nameInLatin: "servis-khab-nozad-lion",
    price: 0,
  },
  {
    id: 13,
    name: "سرویس خواب دو نفره لورا",
    nameInLatin: "servis-khab-do-nafareh-lora",
    price: 0,
  },
  {
    id: 6,
    name: "سرویس خواب نوزاد لیدی",
    nameInLatin: "servis-khab-nozad-Leydi",
    price: 0,
  },
  {
    id: 7,
    name: "سرویس خواب نوزاد لومینا",
    nameInLatin: "servis-khab-nozad-lomina",
    price: 0,
  },
  {
    id: 14,
    name: "سرویس خواب نوجوان جاسمین",
    nameInLatin: "servis-khab-nojavan-jasmin",
    price: 0,
  },
  {
    id: 15,
    name: " سرویس خواب نوجوان پارادایس",
    nameInLatin: "servis-khab-nojavan-paradis",
    price: 0,
  },
  {
    id: 8,
    name: "سرویس خواب نوجوان دزدان دریایی",
    nameInLatin: "servis-khab-nojavan-dozdan-daryayi",
    price: 0,
  },
  {
    id: 16,
    name: "سرویس خواب نوجوان میلان",
    nameInLatin: "servis-khab-nojavan-milan",
    price: 0,
  },
  {
    id: 10,
    name: "سرویس خواب دو نفره آنجل",
    nameInLatin: "servis-khab-do-nafareh-anjel",
    price: 0,
  },
  {
    id: 4,
    name: "سرویس خواب نوزاد وایت لایف",
    nameInLatin: "servis-khab-nozad-Whitelife",
    price: 0,
  },
  {
    id: 11,
    name: "سرویس خواب دو نفره میلان",
    nameInLatin: "servis-khab-do-nafareh-milan",
    price: 0,
  },
]);
</script>
