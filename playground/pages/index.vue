<template>
  <NuxtLayout name="admin">
    <template #main>
      <Tabs
        :items="[
          { label: 'اطلاعات', value: 'info' },
          { label: 'بررسی احراز هویت', value: '1' },
          { label: 'سبدهای خرید', value: '2' },
          { label: 'باشگاه مشتریان', value: '3' },
          { label: 'کیف پول', value: '4' },
          { label: 'گزارش‌ها', value: '5' },
          { label: 'تیکت‌های پشتیبانی', value: '6' },
          { label: 'شماره‌گیر', value: '7' },
        ]"
        query-key="tab"
        dir="rtl"
        :style="{ '--tabs-md-cols': 4 }"
      >
        <template #panel:info>
          <Box> <Header>اطلاعات</Header> </Box></template
        >
        <template #panel:1> <Box> </Box></template>
        <template #panel:2> <Box></Box></template>
        <!-- ... بقیه اسلات‌ها بر اساس value -->
      </Tabs>
    </template>
  </NuxtLayout>
</template>
<script setup>
const route = useRoute();
</script>
