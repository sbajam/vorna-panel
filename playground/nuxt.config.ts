import { resolve } from 'pathe'

export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    'nuxt-icon',  
    resolve(__dirname, '../src/module.ts'),
  ],
  css: ['./assets/css/main.css'],
  nitro: {
    // هر چیزی داخل public/uploads رو با URL زیر /uploads سرو کن
    publicAssets: [
      {
        dir: 'public/uploads',
        baseURL: '/uploads',
        maxAge: 60 * 60 * 24 * 365
      }
    ]
  },
  vornaPanel: {
    name: 'پنل فروشگاه وندو',
    logo: 'https://vendow.ir/_ipx/assets/img/logo.png',
    font: 'Vazir',
    baseUrl: 'https://api.vendow.ir',
    notifications: 'sweetalert',
    menuItems: [
      {
        // بخش اصلی (بدون تیتر)
        items: [
          { path: '/', label: 'داشبورد', icon: 'fa-solid:house' },
          { path: '/auth', label: 'احراز هویت', icon: 'fa-solid:fingerprint' },
          { path: '/information', label: 'ویرایش اطلاعات', icon: 'fa-solid:gear' },
        ],
      },
      {
        title: 'سایت',
        items: [
          { path: '/categories', label: 'دسته‌بندی', icon: 'fa-solid:tags' },
          { path: '/banner', label: 'بنر تبلیغات', icon: 'fa-brands:adversal' },
          { path: '/brands', label: 'برندها', icon: 'fa-solid:handshake' },
          { path: '/texts', label: 'درباره ما', icon: 'fa-solid:info' },
        ],
      },
      {
        title: 'محصولات',
        items: [
          { path: '/product', label: 'لیست محصولات', icon: 'fa-solid:bag-shopping' },
          { path: '/product/add', label: 'اضافه کردن', icon: 'fa-solid:bag-shopping', subIcon: 'fa-solid:plus' },
        ],
      },
      {
        title: 'تعامل با کاربر',
        items: [
          { path: '/cart', label: 'سبد‌های خرید', icon: 'fa-solid:cart-shopping' },
          { path: '/question', label: 'پاسخگویی مشتریان', icon: 'fa-solid:question' },
        ],
      },
      {
        title: 'باشگاه مشتریان',
        items: [
          { path: '/customers', label: 'مشتریان (SMS)', icon: 'fa-solid:comment-sms' },
          { path: '/feedbacks', label: 'نظرات مشتریان', icon: 'fa-solid:comment' },
        ],
      },
      {
        title: 'مالی',
        items: [
          { path: '/offer_codes', label: 'کد تخفیف', icon: 'fa-solid:percent' },
          { path: '/payment', label: 'تسویه حساب', icon: 'fa-solid:money-bill-transfer' },
          { path: '/subscriptions', label: 'اشتراک / سئو', icon: 'fa-solid:circle-up' },
        ],
      },
      {
        title: 'مقاله',
        items: [
          { path: '/blog', label: 'لیست مقالات', icon: 'fa-solid:newspaper' },
          { path: '/blog/add', label: 'اضافه کردن', icon: 'fa-solid:newspaper', subIcon: 'fa-solid:plus' },
        ],
      },
      {
        // بخش پایین (بدون تیتر)
        items: [
          { path: '/requests', label: 'درخواست خدمات', icon: 'ion:reader-outline' },
          { path: '/support/support', label: 'پشتیبانی', icon: 'fa-solid:headset' },
        ],
      },
    ],

  },
})
