<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: My Module
- Package name: my-module
- Description: My new Nuxt module
-->

# My Module

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

My new Nuxt module for doing amazing things.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/my-module?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

<!-- Highlight some of the features your module provide here -->
- ⛰ &nbsp;Foo
- 🚠 &nbsp;Bar
- 🌲 &nbsp;Baz

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxi module add my-module
```

That's it! You can now use My Module in your Nuxt app ✨


## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  npm install
  
  # Generate type stubs
  npm run dev:prepare
  
  # Develop with the playground
  npm run dev
  
  # Build the playground
  npm run dev:build
  
  # Run ESLint
  npm run lint
  
  # Run Vitest
  npm run test
  npm run test:watch
  
  # Release new version
  npm run release
  ```

</details>


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/my-module/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/my-module

[npm-downloads-src]: https://img.shields.io/npm/dm/my-module.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/my-module

[license-src]: https://img.shields.io/npm/l/my-module.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/my-module

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
# راهنمای استفاده از دیتابیس

این ماژول به شما این امکان را می‌دهد که از دیتابیس PostgreSQL استفاده کنید. برای راه‌اندازی و اتصال دیتابیس در پروژه خود، مراحل زیر را دنبال کنید.

## مراحل راه‌اندازی دیتابیس

### 1. نصب وابستگی‌ها

ابتدا وابستگی‌های مورد نیاز را نصب کنید. این وابستگی‌ها شامل `Prisma`, `@prisma/client` و PostgreSQL driver (`pg`) هستند. دستور زیر را در ترمینال وارد کنید:

```bash
npm install prisma @prisma/client pg
2. تنظیم فایل .env

در ریشه پروژه خود، فایل .env را ایجاد کرده و متغیر DATABASE_URL را تنظیم کنید. این URL به دیتابیس PostgreSQL شما اشاره خواهد کرد.

مثال برای PostgreSQL محلی:

DATABASE_URL="postgresql://username:password@localhost:5432/database_name"


اطمینان حاصل کنید که اطلاعات دیتابیس (مانند username, password, localhost, 5432, و database_name) با اطلاعات واقعی شما مطابقت داشته باشد.

3. تولید Prisma client

برای تولید Prisma client، دستور زیر را اجرا کنید تا فایل‌های Prisma client بر اساس اسکیما موجود در پروژه شما تولید شود:

npx prisma generate --schema=node_modules/vorna-panel/dist/runtime/prisma/schema.prisma

4. ایجاد جداول در دیتابیس

پس از تولید Prisma client، برای ایجاد جداول بر اساس اسکیما موجود، دستور زیر را اجرا کنید:

npx prisma db push --schema=node_modules/vorna-panel/dist/runtime/prisma/schema.prisma


این دستور جداول مورد نیاز را در دیتابیس شما ایجاد خواهد کرد.

5. ورود داده‌های اولیه (اختیاری)

اگر نیاز دارید که داده‌های اولیه را به دیتابیس وارد کنید، فایل seed.ts را بررسی کرده و آن را اجرا کنید. این فایل ممکن است شامل داده‌های پیش‌فرض برای جداول باشد. برای اجرای فایل seed.ts، دستور زیر را اجرا کنید:

npx tsx ./path/to/seed.ts


مطمئن شوید که مسیر فایل seed.ts را به درستی وارد کرده‌اید.

6. بررسی و تایید اتصال دیتابیس

پس از انجام مراحل فوق، باید مطمئن شوید که دیتابیس به درستی پیکربندی شده و برنامه به درستی با آن ارتباط برقرار می‌کند. برای این کار، برنامه را اجرا کنید:

npm run dev


پس از اجرا، می‌توانید به صفحه‌ی اصلی برنامه بروید و از طریق لاگ‌ها یا چک کردن داده‌ها، صحت اتصال به دیتابیس را بررسی کنید.

7. اجرای تست‌ها (اختیاری)

اگر پروژه شما شامل تست‌هایی برای بررسی صحت عملکرد دیتابیس است، می‌توانید آن‌ها را با دستور زیر اجرا کنید:

npm run test

8. دستورات مفید برای کار با Prisma

برای راحت‌تر کار کردن با دیتابیس از طریق Prisma، می‌توانید از دستورات زیر استفاده کنید:

برای مشاهده وضعیت فعلی دیتابیس:

npx prisma migrate status --schema=node_modules/vorna-panel/dist/runtime/prisma/schema.prisma


برای ایجاد مایگریشن جدید:

npx prisma migrate dev --schema=node_modules/vorna-panel/dist/runtime/prisma/schema.prisma


برای بررسی ساختار دیتابیس با Prisma Studio:

npx prisma studio --schema=node_modules/vorna-panel/dist/runtime/prisma/schema.prisma