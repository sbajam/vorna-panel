<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box class="">
        <Header class="text-2xl font-bold">InputField Variants Test</Header>
        <div class="grid grid-cols-1 gap-4">
          <!-- Text Input -->
          <InputField
            v-model="textValue"
            label="فیلد متنی:"
            placeholder="نامت رو بنویس"
            errorMessage=""
          />

          <!-- Number Input -->
          <InputField
            v-model="numberValue"
            label="فیلد عددی:"
            type="number"
            placeholder="123"
          />

          <!-- Email Input -->
          <InputField
            v-model="emailValue"
            label="Email"
            type="email"
            placeholder="user@example.com"
            :errorMessage="emailError"
          />
          <button
            @click="validateEmail"
            class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Validate Email
          </button>
          <p v-if="emailError" class="text-red-600">{{ emailError }}</p>

          <!-- Password Input -->
          <InputField
            v-model="passwordValue"
            label="Password"
            type="password"
            placeholder="رمز عبور خود را وارد کنید"
          />

          <!-- Textarea -->
          <InputField
            v-model="textareaValue"
            label="توضیحات"
            label-position="top"
            type="textarea"
            placeholder="Write something..."
            box
          />

          <!-- Disabled -->
          <InputField
            v-model="disabledValue"
            label="Disabled"
            placeholder="Can't type here"
            disabled
          />

          <!-- With Icon & Tooltip -->
          <InputField
            v-model="iconValue"
            label="جستجو"
            placeholder="Search..."
            icon="fa6-solid:magnifying-glass"
            tooltip="Type to search"
          />

          <!-- Error Message -->
          <InputField
            v-model="errorValue"
            label="Required Field"
            :errorMessage="errorMsg"
          />
          <button
            @click="checkRequired"
            class="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Check
          </button>
        </div>
      </Box>
      <Box>
        <!-- تک‌انتخابی -->
        <!-- <DropDown
          v-model="singleValue"
          :items="options"
          placeholder="یک گزینه انتخاب کنید"
          label="تک انتخابی"
          :clearable="true"
          :searchable="true"
        /> -->
        <p class="mt-2">مقدار انتخاب‌شده: {{ singleValue }}</p>

        <!-- چندانتخابی -->
        <!-- <DropDown
          v-model="multiValue"
          :items="options"
          multiple
          placeholder="چند گزینه انتخاب کنید"
          label="چند انتخابی"
          :clearable="true"
          :searchable="true"
       
        /> -->
        <p class="mt-2">مقادیر انتخاب‌شده: {{ multiValue.join(", ") }}</p>

        <!-- بدون جستجو و بدون پاک کردن -->
        <DropDown
          v-model="simpleValue"
          :items="options"
          placeholder="انتخاب کنید"
          label="ساده"
        />
        <p class="mt-2">مقدار انتخاب‌شده: {{ simpleValue }}</p>
      </Box>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">

// تعریف گزینه‌ها
const options = [
  { label: "گزینه اول", value: "one" },
  { label: "گزینه دوم", value: "two" },
  { label: "گزینه سوم", value: "three" },
  { label: "گزینه چهارم", value: "four" },
  "five"
];

// مقادیر بایند شده
const singleValue = ref<string | null>(null);
const multiValue = ref<string[]>([]);
const simpleValue = ref<string | null>(null);

const textValue = ref("");
const numberValue = ref<number | "">("");
const emailValue = ref("");
const emailError = ref("");
const passwordValue = ref("");
const textareaValue = ref("");
const disabledValue = ref("Disabled");
const iconValue = ref("");
const errorValue = ref("");
const errorMsg = ref("");

function validateEmail() {
  const re = /^\S+@\S+\.\S+$/;
  emailError.value = re.test(emailValue.value) ? "" : "ایمیل نامعتبر است";
}

function checkRequired() {
  errorMsg.value = errorValue.value ? "" : "این فیلد الزامی است";
}
</script>
