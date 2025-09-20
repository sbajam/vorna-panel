<script setup>
import { baseUrl } from "~/config";

// definePageMeta({ layout: false, middleware: ["sub-page"] });
const { request, data, pending } = useApi();
const { $notifySuccess, $notifyDanger } = useNuxtApp();
let isGet = ref(true);
let myPlan = ref(null);
let plans = ref([]);
let workSubject = ref(null);
let finalP = ref(0);
let seo = ref(false);
let choosePlan = ref(null);
let level = ref(null);
let indexx = ref(null);
let activePlan = ref({ level: 0, type: 0 });
let totalPrice = ref(0);
let seoP = ref(false);
////////////////////////////
watch(
  () => seo.value,
  (newValue) => {
    if (newValue) {
      if (myPlan.value.seo && !newValue) {
        seo.value = true;
        return $toast.error("شما نمیتواندی اشتراک سئو خود را حذف کنید.");
      }
      if (choosePlan.value) {
        // ابتدا قیمت پایه پلن را در نظر میگیریم
        finalP.value = choosePlan.value.price;
        const seoPricePerDay = workSubject.value.seoPrice / 30;

        if (level.value != myPlan.value.level) {
          // سطح متفاوت: فقط هزینه سئو برای دوره جدید
          const seoPrice = seoPricePerDay * choosePlan.value.count_day;
          finalP.value += Math.ceil(seoPrice / 1000) * 1000;
        } else if (!myPlan.value.seo) {
          // سطح یکسان و قبلا سئو نداشته: هزینه برای دوره جدید + باقیمانده
          const seoPrice =
            seoPricePerDay *
            (choosePlan.value.count_day + myPlan.value.remainder_day);
          finalP.value += Math.ceil(seoPrice / 1000) * 1000;
        } else {
          // سطح یکسان و قبلا سئو داشته: فقط هزینه دوره جدید
          const seoPrice = seoPricePerDay * choosePlan.value.count_day;
          finalP.value += Math.ceil(seoPrice / 1000) * 1000;
        }
      } else {
        // فقط اضافه کردن سئو به پلن فعلی
        const seoPricePerDay = workSubject.value.seoPrice / 30;
        const seoPrice = seoPricePerDay * myPlan.value.remainder_day;
        finalP.value = Math.ceil(seoPrice / 1000) * 1000;
        // seo=myPlan.value.seo
      }
    } else {
      // غیرفعال کردن سئو
      finalP.value = choosePlan.value ? choosePlan.value.price : 0;
    }
  }
);
////////////////////////////
//get
const get = async () => {
  try {
    isGet.value = true;
    const response = await request("subscription");
    if (!response?.status) {
      $notifyDanger(response?.message || "خطا در دریافت اطلاعات");
      return;
    }

    plans.value = response.body.subscriptions;
    plans.value = plans.value.filter((e) => e.level == 1);
    plans.value[0].plans.sort((a, b) => a.price - b.price);

    myPlan.value = response.body.data[0];
    workSubject.value = response.body.work_subject;
  } catch (error) {
    $notifyDanger("مشکلی پیش آمد.");
  } finally {
    isGet.value = false;
  }
};
////////////////////////////////////////////////////////////////////
let code = ref("");
let flag = ref(false);
const offerCode = async () => {
  try {
    flag.value = true;
    const response = await request("offer", {
      baseUrl: baseUrl,
      method: "post",
      data: {
        code: code.value,
        price: finalP.value,
      },
    });

    if (!response?.status) {
      $notifyDanger(response?.message);
      return;
    }

    totalPrice.value = finalP.value;
    finalP.value = response.price;
  } catch (error) {
    $notifyDanger("مشکلی پیش آمد.");
  } finally {
    flag.value = false;
  }
};
////////////////////////////////////////////////////////////////////
const storeBuy = (type) => {
  if (!type) {
    $toast.show({
      type: "danger",
      class: "productToast",
      message: "لطفا ابتدا یکی از مدت زمان ها را انتخاب کنید.",
    });
    return;
  }

  indexx.value = type;
  level.value = 1;
  choosePlan.value = plans.value[0].plans.find((e) => e.index == indexx.value);

  // محاسبه قیمت پایه
  let basePrice = choosePlan.value.price;

  // اعمال تخفیف در صورت واجد شرایط بودن
  const end_date = new Date(parseInt(myPlan.value.finish_date));
  const today = new Date();
  const difference_in_day = Math.floor(
    (end_date - today) / (1000 * 60 * 60 * 24)
  );

  if (difference_in_day > myPlan.value.count_day / 2) {
    const discount = Math.round((30 / 100) * myPlan.value.price);
    basePrice -= discount;
  }

  finalP.value = basePrice;

  // اضافه کردن هزینه سئو در صورت فعال بودن
  if (seo.value && workSubject.value) {
    const seoPricePerDay = workSubject.value.seoPrice / 30;

    if (level.value != myPlan.value.level) {
      // سطح متفاوت: فقط هزینه سئو برای دوره جدید
      const seoPrice = seoPricePerDay * choosePlan.value.count_day;
      finalP.value += Math.ceil(seoPrice / 1000) * 1000;
    } else if (!myPlan.value.seo) {
      // سطح یکسان و قبلا سئو نداشته: هزینه برای دوره جدید + باقیمانده
      const seoPrice =
        seoPricePerDay *
        (choosePlan.value.count_day + myPlan.value.remainder_day);
      finalP.value += Math.ceil(seoPrice / 1000) * 1000;
    } else {
      // سطح یکسان و قبلا سئو داشته: فقط هزینه دوره جدید
      const seoPrice = seoPricePerDay * choosePlan.value.count_day;
      finalP.value += Math.ceil(seoPrice / 1000) * 1000;
    }
  }
};
const remove = () => {
  choosePlan.value = null;

  const seoPricePerDay = workSubject.value.seoPrice / 30;
  const seoPrice = seoPricePerDay * myPlan.value.remainder_day;
  finalP.value = Math.ceil(seoPrice / 1000) * 1000;
};
////////////////////////////////////////////////////
const buy = async () => {
  try {
    isGet.value = true;
    const response = await request("subscription/payment", {
      method: "post",
      data: {
        level: choosePlan.value ? level.value : null,
        index: choosePlan.value ? indexx.value : null,
        price: finalP.value,
        seo: seo.value,
        offerCode: code.value,
      },
    });

    if (!response?.status) {
      $notifyDanger(response?.message);
      return;
    }

    if (response.message === "اشتراک با موفقیت تمدید شد" || !response.url) {
      $notifySuccess(response.message);
      await get();
    } else {
      location.assign(response.url);
    }
  } catch (error) {
    $notifyDanger("مشکلی پیش آمد.");
  }finally {
    isGet.value = false;
  }
};
onBeforeMount(() => {
  get();
});
</script>
<template>
  <NuxtLayout name="admin">
    <template #main>

      <div v-if="isGet">
        <Spinner />
      </div>
      <Box v-if="!isGet" class="my-4">
        <Header>تمدید اشتراک</Header>
        <p class="text-lg mt-6">
          اشتراک خریداری شده شما
          <span v-if="myPlan.count_day >= 30" class="text-secondary-100">
            {{ parseInt(myPlan.count_day / 30) }} ماهه
          </span>
          <span v-else class="text-secondary-100">
            {{ myPlan.count_day }} روزه
          </span>
          میباشد که
          <span v-if="myPlan.remainder_day > 0">
            <span class="text-secondary-100" dir="ltr">
              {{ myPlan.remainder_day }}
            </span>
            روز دیگر از آن باقی مانده
          </span>
          <span v-else>
            <span class="text-secondary-100" dir="ltr">
              {{ myPlan.remainder_day * -1 }}
            </span>
            روز از اتمام آن گذشته
          </span>
          <br />تاریخ اتمام اشتراک :
          <span class="text-secondary-100"> {{ myPlan.finish_date }} </span>
        </p>

        <p class="text-lg mb-2 mt-4 font-bold text-primary-100">
          برای تمدید اشتراک یا ارتقای اشتراک خود یکی از گزینه های زیر را انتخاب
          کنید
        </p>
        <div v-if="!isGet" class="grid md:grid-cols-2 gap-3 xl:gap-6 mt-10">
          <StoreProduct
            v-for="(i, index) in plans[0].plans.filter(
              (e) => e.count_day <= 360
            )"
            :plan="activePlan"
            :data="i"
            :index="i"
            :choosePlan="choosePlan == i"
            :class="{
              'md:col-span-2 lg:col-span-1':
                plans.length % 2 != 0 && index == plans.length - 1,
            }"
            @do="
              (d) => {
                activePlan = { level: d.level, type: d.type };
              }
            "
            @addCart="
              (id) => {
                storeBuy(id.type, 0);
              }
            "
            @remove="remove()"
          />
        </div>
      </Box>
      <Box v-if="!isGet">
        <div class="grid lg:grid-cols-2 gap-16 mt-8">
          <div class="mt-6">
            <h3
              class="font-bold text-lg text-gray-600 border-b border-gray-800 pb-2"
            >
              کد تخفیف
            </h3>
            <div class="flex flex-col items-start gap-2 mt-2">
              <InputField placeholder="کد تخفیف" v-model="code" type="text" />
              <Button
                @click="offerCode()"
                color="secondary-100"
                size="lg"
                class="w-10/12"
                :fullWidth="true"
                :pending="flag"
              >
                اعمال
              </Button>
            </div>
          </div>
          <div class="flex flex-col gap-4">
            <div
              v-if="seo && !myPlan.seo"
              class="flex items-center justify-between gap-4"
            >
              <div class="text-base font-bold text-black">
                قیمت سئو برای پنل فعلی :
              </div>
              <div class="text-base font-bold text-primary-100">
                {{
                  new Intl.NumberFormat("fa-IR").format(
                    parseFloat(
                      (workSubject.seoPrice / 30) * myPlan.remainder_day
                    )
                  )
                }}
              </div>
            </div>
            <div
              v-if="choosePlan"
              class="flex items-center justify-between gap-4"
            >
              <div class="text-base font-bold text-black">
                هزینه تمدید اشتراک انتخاب شده :
              </div>
              <div class="text-base font-bold text-primary-100">
                {{
                  new Intl.NumberFormat("fa-IR").format(
                    parseFloat(choosePlan.price)
                  )
                }}
              </div>
            </div>
            <div
              v-if="choosePlan && seo"
              class="flex items-center justify-between gap-4"
            >
              <div class="text-base font-bold text-black">
                هزینه سئو اشتراک در حال تمدید :
              </div>
              <div class="text-base font-bold text-primary-100">
                {{
                  new Intl.NumberFormat("fa-IR").format(
                    parseFloat(workSubject.seoPrice / 30) * choosePlan.count_day
                  )
                }}
              </div>
            </div>
            <div
              v-if="totalPrice"
              class="flex items-center justify-between gap-4"
            >
              <div class="text-base font-bold text-black">مجموع هزینه ها :</div>
              <div class="text-base font-bold text-primary-100">
                {{
                  new Intl.NumberFormat("fa-IR").format(
                    parseFloat(totalPrice ? totalPrice : finalP)
                  )
                }}
              </div>
            </div>
            <div
              v-if="totalPrice"
              class="flex items-center justify-between gap-4"
            >
              <div class="text-base font-bold text-black">
                هزینه کسر شده تخفیف :
              </div>
              <div class="text-base font-bold text-primary-100">
                {{
                  new Intl.NumberFormat("fa-IR").format(
                    parseFloat(totalPrice - finalP)
                  )
                }}
              </div>
            </div>

            <div
              v-if="finalP || totalPrice"
              class="flex items-center justify-between gap-4"
            >
              <div class="text-2xl font-bold text-black">
                هزینه قابل پرداخت :
              </div>
              <div class="text-2xl font-bold text-primary-100">
                {{ new Intl.NumberFormat("fa-IR").format(parseFloat(finalP)) }}
              </div>
            </div>

            <div v-if="finalP || totalPrice" class="w-full text-center my-8">
              <Button
                color="primary-100"
                size="xl"
                class="w-full"
                @click="buy()"
              >
                پرداخت
              </Button>
            </div>
          </div>
        </div>
      </Box>
    </template>
  </NuxtLayout>
</template>
<style scoped>
/* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: #03377e;
}

input:focus + .slider {
  box-shadow: 0 0 1px #03377e;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
