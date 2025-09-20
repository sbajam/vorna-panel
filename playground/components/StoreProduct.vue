<template>
  
  <div v-if="data.price" class="lg:pt-10">
    <div class="w-10/12 bg-secondary-100 mx-auto rounded-t-2xl h-4"></div>
    <div class="rounded-3xl overflow-hidden bg-white custom-shadow">
      <!-- header -->
      <div class="trapezoid mx-auto !block">
        <h3
          class="content block bg-secondary-100 w-fit mx-auto px-6 py-4 text-white text-xl text-center"
        >
          فروشگاه اینترنتی
          <div v-if="data.count_day >= 30">
            {{ parseInt(data.count_day / 30) }} ماهه
          </div>
          <div v-else-if="data.count_day > 0">{{ data.count_day }} روزه</div>
          <div v-else>VIP</div>
        </h3>
      </div>

      <!-- features -->
      <div class="py-4 px-4">
        <div
          v-for="(f, i) in sortedFeatures"
          :key="i"
          class="flex items-center gap-2 px-4 my-2"
        >
          <font-awesome-icon
            :icon="['fas', 'check-circle']"
            :class="
              f == 'سایر ویژگی‌ها ...' ? 'text-secondary' : 'text-secondary'
            "
          />
          <span class="text-lg">{{ f }}</span>
        </div>
      </div>

      <!-- why this plan -->
      <div v-if="whyText" class="px-4 pt-2 border-t">
        <h4 class="font-bold text-center mb-1">چرا این پلن؟</h4>
        <p class="text-center text-secondary-100 font-bold mb-4">{{ whyText }}</p>
      </div>

      <!-- read more article -->
      <div class="px-4 mb-4 text-center">
        <a
        targetedit
          :href="`https://vendow.ir/blog/${
            data.count_day >= 360
              ? 'Vendow-12-Month-Plan:-Build-Your-Online-Store-for-3.49M-IRR-with-Premium-Features'
              : data.count_day >= 180
              ? 'Vendo-6-Month-Plan:-Professional-Online-Store-for-1.99M-IRR'
              : ''
          }`"
          class="text-sm text-gray-800 underline hover:text-secondary-100"
        >
          برای اطلاعات بیشتر اینجا کلیک کنید
        </a>
      </div>

      <!-- price -->
      <div class="px-10 md:px-4 lg:px-10 divide-gray-200 divide-y-2">
        <div class="flex gap-2 w-full justify-center text-xl font-bold pt-4">
          <div v-if="data.price === 0" class="text-green-600">رایگان</div>
          <div v-else>
            {{ new Intl.NumberFormat("fa-IR").format(data.price) }} هزارتومان
          </div>
        </div>
      </div>

      <!-- order button -->
      <div class="w-full text-center my-8">
        <button v-if="props.choosePlan"
          class="text-white bg-red-600 text-xl flex items-center gap-2 rounded-xl px-8 py-2 mx-auto"
          @click="emit('remove')"
        >
          حذف انتخاب
          <font-awesome-icon :icon="['fas', 'trash']" class="text-base" />
        </button>
        <button
        v-else
          class="text-white bg-primary-100 text-xl flex items-center gap-2 rounded-xl px-8 py-2 mx-auto"
          @click="addCart()"
        >
          سفارش فروشگاه
          <font-awesome-icon :icon="['fas', 'arrow-left']" class="rotate-45" />
        </button>
      </div>
    </div>
  </div>

</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  /** آدرس مقاله برای مطالعه بیشتر */
  articleUrl: {
    type: String,
    default: "#",
  },choosePlan:{
    type:Boolean,
    default:false
  }
});
const emit = defineEmits(["addCart","remove"]);
// تعریف همه‌ی فیچرها بر اساس کلید
const attribute = {
  3: [
    // "مهلت تست رایگان",
    // "سئوتکنیکال",
    // "باشگاه مشتریان",
    // "پیگیری سفارش",
    // "سرعت بالا",
    // "مدیریت محتوا",
    // "درج مقاله",
    // "رنگ اختصاصی",
    // "درگاه پرداخت",
    "    فعال‌سازی آنی و سریع",
    "امکان بارگذاری محصولات",
    "قالب آماده و واکنش‌گرا",
    "بدون نیاز به هاست و دامنه",
    "تست سبد خرید و سفارش‌گیری",
    "انتخاب رنگ برند دلخواه",
    "قابلیت ثبت مقاله تستی",
    "مشاهده نمونه باشگاه مشتریان",
    "تجربه کامل قبل از خرید",
  ],
  180: [
    // "سئوتکنیکال",
    // "باشگاه مشتریان",
    // "پیگیری سفارش",
    // "سرعت بالا",
    // "مدیریت محتوا",
    // "درج مقاله",
    // "رنگ اختصاصی",
    // "درگاه پرداخت",
    // "دسته‌بندی ۲مرحله‌ای",
    "فعال‌سازی فوری فروشگاه",
    "محصول نامحدود قابل بارگذاری",
    "بدون نیاز به هاست و دامنه",
    "درگاه پرداخت و سبد خرید",
    "سئو تکنیکال + سرعت بالا",
    "پیام گروهی به مشتریان",
    "نقشه‌یابی با گوگل و بلد",
    "انتشار مقاله برای سئو",
    "انتخاب رنگ برند دلخواه",
  ],
  365: [
    // 'سئوتکنیکال',
    // 'باشگاه مشتریان',
    // 'پیگیری سفارش',
    // 'سرعت بالا',
    // 'مدیریت محتوا',
    // 'درج مقاله',
    // 'رنگ اختصاصی',
    // 'درگاه پرداخت',
    // "سایر ویژگی‌ها ...",
    // "دسته‌بندی ۲مرحله‌ای",
    // "۱ جلسه کوچینگ",
    // "کدنویسی آماده",
    // "پشتیبانی اختصاصی",
    // "۱۵ محصول سئوکاری",
    // "۱ بنر اختصاصی",
    "  تمام امکانات + پشتیبانی",
    "۱ جلسه کوچینگ رایگان",
    "سئو رایگان ۱۵ محصول",
    "طراحی ۱ بنر تبلیغاتی",
    "گزینه تماس بگیرید محصول",
    "اتصال اینستاگرام و واتساپ",
    "کامنت با تأیید مدیریت",
    "تعریف کد تخفیف دلخواه",
    "لیست علاقه‌مندی محصول",
  ],
  Vip: [
    // 'سئوتکنیکال',
    // 'باشگاه مشتریان',
    // 'پیگیری سفارش',
    // 'سرعت بالا',
    // 'مدیریت محتوا',
    // 'درج مقاله',
    // 'رنگ اختصاصی',
    // 'درگاه پرداخت',

    "  تمام امکانات + پشتیبانی",
    "۱ جلسه کوچینگ رایگان",
    "سئو رایگان ۱۵ محصول",
    "طراحی ۱ بنر تبلیغاتی",
    "گزینه تماس بگیرید محصول",
    "اتصال اینستاگرام و واتساپ",
    "کامنت با تأیید مدیریت",
    "تعریف کد تخفیف دلخواه",
    "لیست علاقه‌مندی محصول",
  ],
};

// ترتیب پلان‌ها برای استخراج قبلی
const planOrder = [3, 180, 365, "Vip"];

// محاسبه‌ی کلید پلان فعلی
const planKey = computed(() => {
  const d = props.data.count_day;
  return attribute[d] ? d : "Vip";
});

// فیچرهای پلان جاری
const features = computed(() => attribute[planKey.value]);

// فیچرهای پلان قبلی (برای مقایسه‌ی انحصاری)
const prevIndex = planOrder.findIndex((k) => k === planKey.value) - 1;
const prevList = prevIndex >= 0 ? attribute[planOrder[prevIndex]] : [];

// فیچرهای انحصاری
const exclusiveFeatures = computed(() =>
  features.value.filter((f) => !prevList == f)
);

// مرتب‌سازی: اول انحصاری‌ها بعد بقیه
const sortedFeatures = computed(() => {
  const excl = exclusiveFeatures.value;
  const rest = features.value.filter((f) => !excl.includes(f));
  return [...excl, ...rest];
});

// متن «چرا این پلن؟»
const whyMap = {
  3: "شروع رایگان!",
  180: "ارزان و کامل برای شروع!",
  365: "حرفه‌ای با کوچینگ و پشتیبانی!",
  Vip: "برند اختصاصی با لوگو و بنر!",
};
const whyText = computed(() => whyMap[planKey.value] || "");

// افزودن به سبد
// function addCart() {
//   emit("addCart", {
//     id: props.data.id ?? planKey.value,
//     type: `${planKey.value}`,
//   });
// }
const addCart = () => {
  emit("addCart", { id: 1, type: `${props.data.index}` });
};
</script>
<style>
.custom-shadow {
  box-shadow: 2px 1px 5px 0 #00000020, -2px -1px 5px 0 #00000020;
}
.trapezoid {
  position: relative;
  display: inline-block;

  .content {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    border-radius: 0 0 2rem 2rem;
    &:before {
      content: " ";
      display: block;
      background: inherit;
      width: 35px;
      height: 101%;
      position: absolute;
      top: -1px;
      left: -20px;
      transform: skew(34deg);
      border-radius: 0 0 0 2rem;
      z-index: -1;
    }
    &:after {
      content: " ";
      display: block;
      background: inherit;
      width: 35px;
      height: 101%;
      position: absolute;
      top: -1px;
      right: -20px;
      transform: skew(-34deg);
      border-radius: 0 0 2rem 0;
      z-index: -1;
    }
  }
}
</style>