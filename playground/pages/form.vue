<!-- pages/playground/button-playground.vue -->
<script setup>
const countries = [
  { label: "ایران", value: "ir", code: "+98" },
  { label: "آمریکا", value: "us", code: "+1" },
  { label: "کانادا", value: "ca", code: "+1" },
];
let text = ref("sghl");
const single = ref(null);
const singleWithCode = ref(null);
const singleEmpty = ref(null);
const multi = ref([]);
const images = ref(null);
const config = useRuntimeConfig();
</script>

<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box class="space-y-6">
        <Header>DropDown Playground</Header>
        <div class=" grid grid-cols-4 gap-4">
          <div class="space-y-4">
            <h3 class="font-medium">تک انتخاب (clearable)</h3>
            <DropDown
              v-model="single"
              :items="countries"
              labelField="label"
              valueField="value"
              placeholder="یک کشور انتخاب کنید"
              :clearable="true"
            />
            <div>انتخاب‌شده: {{ single }}</div>
          </div>

          <div class="space-y-4">
            <h3 class="font-medium">تک انتخاب با نمایش code</h3>
            <DropDown
              v-model="singleWithCode"
              :items="countries"
              labelField="label"
              valueField="value"
              displayField="code"
              placeholder="یک کشور"
              :clearable="true"
            />
            <div>انتخاب‌شده: {{ singleWithCode }}</div>
          </div>

          <div class="space-y-4">
            <h3 class="font-medium">تک انتخاب با گزینه خالی</h3>
            <DropDown
              v-model="singleEmpty"
              :items="[...countries]"
              labelField="label"
              valueField="value"
              placeholder="یا هیچ"
              :clearable="true"
            />
            <div>انتخاب‌شده: {{ singleEmpty }}</div>
          </div>
          <div class="space-y-4">
            <h3 class="font-medium">چند انتخابی + جستجو</h3>
            <DropDown
              v-model="multi"
              :items="['1', '2', '3', '4', '5', '6', '7', '8', '9']"
              multiple
              searchable
              placeholder="چند کشور"
              :clearable="true"
            />
            <div>لیست انتخاب‌شده: {{ multi }}</div>
          </div>
          <div class="space-y-4">
            <h3 class="font-medium">چند انتخابی + جستجو</h3>
            <DropDown
              v-model="multi"
              :items="countries"
              multiple
              searchable
              labelField="label"
              valueField="value"
              placeholder="چند کشور"
              :clearable="true"
            />
            <div>لیست انتخاب‌شده: {{ multi }}</div>
          </div>
        </div>
        <ImageUploader
          v-model:images="images"
          :multiple="true"
          :watermark="true"
          watermarkText="Watermark Text"
          :baseUrl="config.public.baseURL"
        />
        <Editor v-model="text" />
      </Box>
    </template>
  </NuxtLayout>
</template>
