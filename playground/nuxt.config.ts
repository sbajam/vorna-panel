import { resolve } from 'pathe'

export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/icon',
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
    ],
    compatibility: {
      date: '2025-07-26'
    }
  },
  vornaPanel: {
    name: 'پنل فروشگاه وندو',
    logo: 'https://vendow.ir/img/logo.png',
    font: 'Vazir',
    baseUrl: 'https://api.vendow.ir/admins',
    notifications: 'sweetalert',
    menuItems: [
      {
        title: 'مدیریت سیستم',
        collapsed: false, // یا true اگر بخوای بسته باشه
        items: [
          { path: '/roles', label: 'نقش‌ها', icon: 'fa-solid:user-shield' },
          { path: '/permissions', label: 'دسترسی‌ها', icon: 'fa-solid:lock' },
          { path: '/access', label: 'دسترسی مسیرها', icon: 'fa-solid:route' },
          { path: '/logs', label: 'فعالیت‌ها', icon: 'fa-solid:clipboard-list' },
          { path: '/errorsLog', label: 'لاگ خطاها', icon: 'fa-solid:triangle-exclamation' },
          { path: '/formBuilder', label: 'فرمساز', icon: 'fa-solid:object-group' },
        ],
      },
      {
        title: 'صفحات تستی',
        collapsed: true,
        items: [
          { path: '/form', label: 'فرم A', icon: 'fa-solid:wpforms', guest: true },
          { path: '/formB', label: 'فرم B', icon: 'fa-solid:wpforms', guest: true },
          { path: '/formTest', label: 'فرم تست', icon: 'fa-solid:flask', guest: true },
          { path: '/button', label: 'دکمه‌ها', icon: 'fa-solid:toggle-on', guest: true },
          { path: '/fcomponents', label: 'کامپوننت‌ها', icon: 'fa-solid:boxes', guest: true },
          { path: '/useapi', label: 'API تست', icon: 'fa-solid:plug', guest: true },
        ],
      },

      {
        title: 'صفحات تستی',

        items: [
          { path: '/', label: 'داشبورد', icon: 'fa-solid:house' },
          { path: '/auth', label: 'احراز هویت', icon: 'fa-solid:fingerprint' },
          { path: '/information', label: 'ویرایش اطلاعات', icon: 'fa-solid:gear' },
        ],
      },
      {
        title: 'سایت',
        collapsed: true,
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
        title: 'سایر',
        items: [
          { path: '/requests', label: 'درخواست خدمات', icon: 'ion:reader-outline' },
          { path: '/support/support', label: 'پشتیبانی', icon: 'fa-solid:headset' },
          { path: '/login', label: 'ورود', icon: 'fa-solid:right-to-bracket', guest: true },
          { path: '/403', label: 'عدم دسترسی', icon: 'fa-solid:ban', guest: true },
        ],
      },
    ]


  },
  vite: {
  define: {
    'process.env': {},
  },
}

})
