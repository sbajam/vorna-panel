<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box class="">
        <Header class="text-2xl font-bold">InputField Variants Test</Header>
        <div class="grid grid-cols-1 gap-4">
          <!-- Text Input -->
          <InputField
            v-model="price"
            label="قیمت"
            :mask="{ mask: Number, thousandsSeparator: ',', unmask: true }"
            suffix="تومان"
          />
          <p class="text-gray-600">مقدار بایند شده: {{ price }}</p>
          <InputField
            v-model="amount"
            label="مبلغ پرداختی"
            :mask="{
              mask: Number, // عدد
              thousandsSeparator: ',', // جداکننده هزارگان
              scale: 2, // دو رقم اعشار
              radix: '.', // جداکننده اعشار
              mapToRadix: ['.'], // ورودی نقطه را به radix تبدیل کن
            }"
            prefix="$"
            placeholder="مثال: $ 1,234.50"
          />
          <p>مقدار خام: {{ amount }}</p>
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
          <InputField
            label="تاریخ شمسی"
            icon="fa6-solid:calendar"
            tooltip="تاریخ شمسی را انتخاب کنید"
            v-model="date"
            type="date"
            input-format="jYYYY/jMM/jDD"
            display-format="jYYYY/jMM/jDD"
            placeholder="تاریخ را انتخاب کنید"
            :auto-submit="true"
            :single="true"
            :color="'blue'"
            calendar-type="persian"
          />
          <InputField label="color" type="color" />
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
        <DropDown
          v-model="singleValue"
          :items="options"
          placeholder="یک گزینه انتخاب کنید"
          label="تک انتخابی"
          :clearable="true"
          :searchable="true"
        />
        <p class="mt-2">مقدار انتخاب‌شده: {{ singleValue }}</p>

        <!-- چندانتخابی -->
        <DropDown
          v-model="multiValue"
          :items="options"
          multiple
          placeholder="چند گزینه انتخاب کنید"
          label="چند انتخابی"
          :clearable="true"
          :searchable="true"
        />
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
      <Box class="flex flex-col gap-4">
        <RadioGroup
          v-model="selectedColor"
          :options="colorOptions"
          name="colors"
          groupLabel="انتخاب رنگ:"
          direction="horizontal"
          icon="fa6-solid:ban"
          tooltip="This option is disabled"
        />
        <p>رنگ انتخاب شده: {{ selectedColor }}</p>
        <RadioGroup v-model="single" value="1" label="Accept Terms" />
        <p>Value: {{ single }}</p>
        <RadioGroup
          v-model="selectedColor"
          :options="colorOptions"
          name="colors"
          groupLabel="انتخاب رنگ:"
          label-position="top"
          direction="vertical"
        />
        <p>رنگ انتخاب شده: {{ selectedColor }}</p>
        <RadioGroup v-model="single" value="1" label="Accept Terms" />
        <p>Value: {{ single }}</p>

        <h2>Disabled</h2>
        <RadioGroup
          v-model="singleDisabled"
          label="Can't touch this"
          disabled
        />
        <p>Value: {{ singleDisabled }}</p>

        <h2>With Error</h2>
        <RadioGroup
          v-model="singleError2"
          label="Required"
          value="true"
          icon="fa6-solid:ban"
          tooltip="This option is disabled"
          :required="true"
          errorMessage="This field is required."
        />
      </Box>
      <Box class="flex flex-col gap-4 p-4">
        <!-- Single Checkbox (default position) -->
        <CheckBoxGroup v-model="single2" value="yes" label="Accept Terms" />
        <p>Value: {{ single2 }}</p>

        <!-- Single Checkbox (label top) -->
        <CheckBoxGroup
          v-model="singleTop"
          value="agree"
          label="I Agree"
          labelPosition="top"
        />
        <p>Value: {{ singleTop }}</p>

        <!-- Disabled Single -->
        <CheckBoxGroup
          v-model="singleDisabled2"
          value="no"
          label="Can't touch this"
          disabled
        />
        <p>Value: {{ singleDisabled2 }}</p>

        <!-- With Error -->
        <CheckBoxGroup
          v-model="singleError"
          value="true"
          label="Required"
          required
          errorMessage="This field is required."
        />

        <h2>Group Mode</h2>
        <!-- Group Horizontal -->
        <CheckBoxGroup
          v-model="group3"
          :options="optList"
          groupLabel="Select Options:"
          direction="horizontal"
        />
        <p>Selected: {{ group3 }}</p>

        <!-- Group Vertical, label top -->
        <CheckBoxGroup
          v-model="group3"
          :options="optList"
          groupLabel="Select Options:"
          labelPosition="top"
          direction="vertical"
        />
        <p>Selected: {{ group3 }}</p>

        <!-- Disabled Group -->
        <CheckBoxGroup
          v-model="groupDisabled"
          :options="optList"
          groupLabel="Disabled Group:"
          disabled
        />
        <p>Selected: {{ groupDisabled }}</p>

        <!-- Group With Error -->
        <CheckBoxGroup
          v-model="groupError"
          :options="optList"
          groupLabel="Select at least one:"
          required
          errorMessage="Please select an option."
        />
      </Box>
      <Box>
        <ToggleSwitch
          label="Toggle Switch"
          label-position="top"
          icon="fa6-solid:pen"
          tooltip="This is a tooltip"
          v-model="toggleDefault"
        />
        <p>Value: {{ toggleDefault }}</p>

        <h2 class="text-lg font-semibold">With Labels</h2>
        <ToggleSwitch v-model="toggleLabels" on-label="On" off-label="Off" />
        <p>Value: {{ toggleLabels }}</p>

        <h2 class="text-lg font-semibold">Different Sizes</h2>
        <div class="flex items-center gap-6">
          <ToggleSwitch v-model="toggleSm" size="sm" />
          <ToggleSwitch v-model="toggleMd" size="md" />
          <ToggleSwitch v-model="toggleLg" size="lg" />
        </div>
        <p>Sizes: sm={{ toggleSm }}, md={{ toggleMd }}, lg={{ toggleLg }}</p>

        <h2 class="text-lg font-semibold">Custom Colors</h2>
        <ToggleSwitch
          v-model="toggleColors"
          on-color="bg-green-500"
          off-color="bg-red-300"
          on-label="Active"
          off-label="Inactive"
          label-position="right"
        />
        <p>Value: {{ toggleColors }}</p>

        <h2 class="text-lg font-semibold">Disabled State</h2>
        <ToggleSwitch v-model="toggleDisabled" disabled />
        <p>Value: {{ toggleDisabled }}</p>
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
  "five",
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
const amount = ref(0);
const errorMsg = ref("");
const price = ref("");
const single = ref(false);
const singleDisabled = ref(false);
const singleError = ref(false);
const group = ref<string[]>([]);
const colorOptions = [
  { label: "قرمز", value: "red" },
  { label: "سبز", value: "green" },
  { label: "آبی", value: "blue" },
];
const selectedColor = ref<string | number>(null);
const single2 = ref(false);
const singleTop = ref(false);
const singleDisabled2 = ref(false);
const singleError2 = ref(false);
let date = ref();
const optList = [
  { label: "Option A", value: "A" },
  { label: "Option B", value: "B" },
  { label: "Option C", value: "C" },
];
const toggleDefault = ref(false);
const toggleLabels = ref(false);
const toggleSm = ref(false);
const toggleMd = ref(true);
const toggleLg = ref(false);
const toggleColors = ref(false);
const toggleDisabled = ref(true);
const group3 = ref<Array<string | number>>([]);
const group2 = ref<Array<string | number>>([]);
const groupDisabled = ref<Array<string | number>>([]);
const groupError = ref<Array<string | number>>([]);
function validateEmail() {
  const re = /^\S+@\S+\.\S+$/;
  emailError.value = re.test(emailValue.value) ? "" : "ایمیل نامعتبر است";
}

function checkRequired() {
  errorMsg.value = errorValue.value ? "" : "این فیلد الزامی است";
}
</script>
