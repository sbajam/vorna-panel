// src/module.ts
/**
 * Vorna Panel - A Nuxt.js module for admin panel with role-based access control
 * 
 * This module provides:
 * - Authentication & Authorization
 * - Role-based access control
 * - User activity logging
 * - Error logging
 * - File management
 * - UI components
 */

import { defineNuxtModule, createResolver, extendPages, addLayout, installModule, addComponent, addPlugin, addImportsDir, addServerHandler, addRouteMiddleware } from '@nuxt/kit'
import { defu } from 'defu'
import path from 'path'
import { resolve as resolvePath } from 'path'
import { execSync } from 'child_process'
import { execaSync } from 'execa'

/**
 * Module configuration options
 */
export interface ModuleOptions {
  name?: string
  menuItems?: Array<object>
  logo?: string
  showOnlineStatus?: boolean
  font?: string// Vazir , IranSans , Roya
  baseUrl?: string,
  notifications?: String
  logBehavior?: boolean  // آیا لاگ‌گیری رفتار (PAGE_VIEW, API_REQUEST) فعال باشد؟
  logErrors?: boolean  // آیا لاگ‌گیری خطا (ErrorLog) فعال باشد؟
  superAdmins?: string[]
  guestRoutes?: string[] // مسیرهایی که کاربر مهمان می‌تواند به آنها دسترسی داشته باشد
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@VornaCo/vorna-panel',
    configKey: 'vornaPanel',
    compatibility: { nuxt: '^3.0.0' },
  },

  /**
   * Default module options
   */
  defaults: {
    // Basic panel configuration
    name: 'پنل مدیریت',
    menuItems: [],
    logo: '../logo.png',
    showOnlineStatus: true,
    font: 'Vazir',
    notifications: 'toast',

    // Logging configuration
    logBehavior: true,    // Enable behavior logging (PAGE_VIEW, API_REQUEST)
    logErrors: true,      // Enable error logging

    // Access control
    superAdmins: ['admin'],  // Usernames/emails with full access
    guestRoutes: ['/login', '/403', '/404'],  // Public routes
  },
  async setup(options, nuxt) {
    // A) پیکربندی اولیه
    const { resolve } = createResolver(import.meta.url)

    /**
     * B) Database & Prisma Setup
     * - Generate Prisma Client
     * - Handle migrations
     * - Setup database tables
     */
    const moduleSchema = path.resolve(__dirname, './runtime/prisma/schema.prisma')
    if (process.env.PRISMA_AUTO_GENERATE === 'true') {
      nuxt.hook('build:before', () => {
        execaSync(
          'npx',
          ['prisma', 'generate', `--schema=${moduleSchema}`],
          { cwd: nuxt.options.rootDir, stdio: 'inherit' }
        )

        execaSync(
          'npx',
          ['prisma', 'db', 'push', `--schema=${moduleSchema}`],
          { cwd: nuxt.options.rootDir, stdio: 'inherit' }
        )
      })
    }




    // ———————————————
    // الف) (اختیاری) اجرای خودکار Prisma Migrate برای ساخت جدول UserLog
    // اگر از Prisma استفاده نمی‌کنید یا نمی‌خواهید خودکار مایگریشن باشد،
    // مثلاً اینجاست که prisma/schema.prisma شما قرار گرفته.
    // nuxt.hook('ready', () => {
    //   try {
    //     const schemaPath = path.resolve(__dirname, './runtime/prisma/schema.prisma')
    //     // در لحظهٔ اجرا، دستور migrate deploy را صدا می‌زنیم
    //     execSync(`npx prisma migrate deploy --schema="${schemaPath}"`, {
    //       stdio: 'inherit',
    //     })
    //   } catch (e) {
    //     console.warn('[vorna-panel] Prisma migrate failed:', e.message)
    //   }
    // })
    // ———————————————

    /**
     * C) Nitro & Runtime Configuration
     */
    // 1. Nitro Configuration
    nuxt.hook('nitro:config', (config) => {
      // Configure file upload endpoint
      config.routeRules = {
        ...(config.routeRules || {}),
        '/api/images-list': { bodyParser: false } as any // Type assertion for bodyParser
      }

      // Setup public assets serving
      config.publicAssets = [
        ...(config.publicAssets || []),
        {
          dir: path.resolve(nuxt.options.rootDir, 'public', 'uploads'),
          baseURL: '/uploads',
          maxAge: 60 * 60 * 24 * 30 // 30 days cache
        }
      ]
    })

    // 2. Runtime Configuration
    // Private runtime config (server-side only)
    nuxt.options.runtimeConfig.private = defu(
      nuxt.options.runtimeConfig.private,
      {
        vornaPanel: {
          rootDir: nuxt.options.rootDir
        }
      }
    )

    // Public runtime config (available on client-side)
    nuxt.options.runtimeConfig.public.vornaPanel = defu(
      nuxt.options.runtimeConfig.public.vornaPanel,
      {
        name: options.name,
        menuItems: options.menuItems,
        logo: options.logo,
        showOnlineStatus: options.showOnlineStatus,
        font: options.font,
        baseUrl: options.baseUrl,
        notifications: options.notifications,
        logBehavior: options.logBehavior,
        logErrors: options.logErrors,
        superAdmins: options.superAdmins,
      },
    )
    // نصب و پیکربندی Tailwind
    await installModule('@nuxtjs/tailwindcss', {
      exposeConfig: true,
      config: {
        content: [
          resolve('./runtime/**/*.{vue,js,ts,jsx,tsx}'),
          resolve('./components/**/*.{vue,js,ts,jsx,tsx}'),
        ],
        darkMode: 'class',
      },
    })
   
    nuxt.options.build!.transpile.push('@alireza-ab/vue3-persian-datepicker')
    nuxt.options.build.transpile ||= []
    nuxt.options.build.transpile.push('vue3-grid-layout')

    nuxt.options.vite.optimizeDeps ||= {}
    nuxt.options.vite.optimizeDeps.include ||= []
    nuxt.options.vite.optimizeDeps.include.push('vue3-grid-layout')

    addPlugin(resolve('./runtime/plugins/datepicker.client.js'))

    // اضافه کردن فایل SCSS
    nuxt.options.css.unshift(resolve('./runtime/assets/admin.scss'))
    nuxt.options.css.unshift(resolve('./runtime/assets/font.scss'))
    nuxt.options.alias['~vorna-stores'] = resolve('./runtime/stores')

    addImportsDir(resolve('./runtime/composables'))
    // 1) ثبت پوشه‌ی middleware برای auto‑import
    addImportsDir(resolve('./runtime/middleware'))
    nuxt.options.router.middleware ||= []
    nuxt.options.router.middleware.push('check-auth.global')
    addRouteMiddleware({
      name: 'check-auth',
      path: resolve('./runtime/middleware/check-auth.global.ts'),
      global: true
    })

    // 2) ثبت صفحه‌ی لاگین در مسیر /login
    extendPages((pages) => {
      pages.push({
        name: 'login',
        path: '/login',
        file: resolve('./runtime/pages/login.vue')
      })
      pages.push({
        name: '403',
        path: '/403',
        file: resolve('./runtime/pages/403.vue')
      })
    })
    extendPages((pages) => {
      pages.push({
        name: 'access',
        path: '/access',
        file: resolve('./runtime/pages/access.vue')
      })
    })

    // addPlugin({
    //   src: resolve('./runtime/plugins/global-middleware.client.ts'),
    //   mode: 'client'
    // })

    // // 3) ثبت یک پلاگین client‑side که middleware را فعال می‌کند
    // addPlugin({
    //   src: resolve('./runtime/plugins/.ts'),
    //   mode: 'client'
    // })

    addImportsDir(resolve('./runtime/stores'))

    // ———————————————
    // ب) ثبت پلاگین‌های Client-Side برای لاگِ درخواست‌ها و لاگِ تغییر صفحه:
    //    این دو فایل در runtime/plugins قرار می‌گیرند:

    // ———————————————

    /**
     * F) Layouts, Pages & Components Registration
     */

    // 1. Layouts
    const layouts = [
      { name: 'admin', file: 'admin.vue' },
      { name: 'modal', file: 'modal.vue' }
    ]

    layouts.forEach(layout => {
      addLayout({
        src: resolve(`./runtime/layouts/${layout.file}`),
        filename: layout.file,
      })
    })

    // 2. Components by Category

    // 2.1 Layout Components (اجزای اصلی رابط کاربری)
    const layoutComponents = [
      { name: 'Sidebar', file: 'Sidebar.vue' },
      { name: 'Header', file: 'Header.vue' },
      { name: 'Box', file: 'Box.vue' },
      { name: 'Breadcrumb', file: 'Breadcrumb.vue' }
    ]

    // 2.2 Form Components (اجزای فرم)
    const formComponents = [
      { name: 'InputField', file: 'InputField.vue' },
      { name: 'RadioGroup', file: 'RadioGroup.vue' },
      { name: 'CheckBoxGroup', file: 'CheckBoxGroup.vue' },
      { name: 'ToggleSwitch', file: 'ToggleSwitch.vue' },
      { name: 'DropDown', file: 'DropDown.vue' },
      { name: 'Editor', file: 'Editor.vue' }
    ]

    // 2.3 Form Builder Components (اجزای فرم‌ساز)
    const formBuilderComponents = [
      { name: 'FormBuilder', file: 'FormBuilder.vue' },
      { name: 'FieldArray', file: 'FieldArray.vue' },
      { name: 'PropertiesPanel', file: 'PropertiesPanel.vue' },
      { name: 'FieldPalette', file: 'FieldPalette.vue' },
      { name: 'FormSettingsPanel', file: 'FormSettingsPanel.vue' },
      { name: 'SectionSettingsPanel', file: 'SectionSettingsPanel.vue' }
    ]

    // 2.4 Media Components (اجزای مدیریت رسانه)
    const mediaComponents = [
      { name: 'ImageUploader', file: 'ImageUploader.vue' },
      { name: 'FileUploader', file: 'FileUploader.vue' },
      { name: 'ImageP', file: 'ImageP.vue' }
    ]

    // 2.5 UI Utilities (اجزای کمکی رابط کاربری)
    const utilComponents = [
      { name: 'SmartTable', file: 'SmartTable.vue' },
      { name: 'Spinner', file: 'Spinner.vue' },
      { name: 'Button', file: 'Button.vue' }
    ]
    const dashboardComponents = [
      { name: 'DashboardGrid', file: 'dashboard/DashboardGrid.vue' },
      { name: 'DashboardWidget', file: 'dashboard/DashboardWidget.vue' },
      { name: 'DashboardSwitcher', file: 'dashboard/DashboardSwitcher.vue' },
      { name: 'DashboardFavorites', file: 'dashboard/DashboardFavorites.vue' },
      { name: 'DashboardView', file: 'dashboard/DashboardView.vue' },
      { name: 'BaseCard', file: 'dashboard/BaseCard.vue' },
      { name: 'AddFavP', file: 'dashboard/AddFavP.vue' },
      { name: 'ChartWidget', file: 'widgets/ChartWidget.client.vue' },
      { name: 'RecordList', file: 'widgets/RecordList.vue' },
      { name: 'statCard', file: 'widgets/statCard.vue' },
      { name: 'WidgetHeader', file: 'widgets/WidgetHeader.vue' },

    ]

    // Register all components
    const allComponents = [
      ...layoutComponents,
      ...formComponents,
      ...formBuilderComponents,
      ...mediaComponents,
      ...utilComponents,
      ...dashboardComponents
    ]

    allComponents.forEach(component => {
      addComponent({
        filePath: resolve(`./runtime/components/${component.file}`),
        name: component.name,
      })
    })
    extendPages((pages) => {

      pages.push({
        name: 'formBuilder',
        path: '/formBuilder',
        file: resolve('./runtime/pages/formBuilder.vue'),
      })

      pages.push({
        name: 'permissions',
        path: '/permissions',
        file: resolve('./runtime/pages/permissions.vue'),
      })
      pages.push({
        name: 'roles',
        path: '/roles',
        file: resolve('./runtime/pages/roles.vue'),
      })
    })

    // اگر از toast استفاده می‌کنند، ماژول tailvue را نصب کن
    await installModule('@tailvue/nuxt')
    await installModule('@nuxt/icon')
    addPlugin(resolve('./runtime/plugins/notifications.js'))
    addPlugin({
      src: resolve('./runtime/plugins/pinia.js'),
      mode: 'client',
    })
    addPlugin({
      src: resolve(__dirname, 'runtime/plugins/vue-apexcharts.client'),
      mode: 'client',
    })

    // addPlugin(resolve('./runtime/plugins/pinia.js'))

    /**
     * D) API Routes Configuration
     */

    // 1. Role Management APIs
    const roleHandlers = [
      { route: '/api/roles', method: 'get', handler: 'roles.get.js' },
      { route: '/api/roles', method: 'post', handler: 'roles.post.js' },
      { route: '/api/roles/:id', method: 'put', handler: 'roles.put.js' },
      { route: '/api/roles/:id', method: 'delete', handler: 'roles.delete.js' },

    ]
    for (const h of roleHandlers) {
      addServerHandler({
        route: h.route,
        method: h.method as 'get' | 'post' | 'put' | 'delete',
        handler: resolve(`./runtime/server/api/${h.handler}`)
      })
    }
    const permissionHandlers = [
      { route: '/api/permissions', method: 'get', handler: 'permissions.get.js' },
      { route: '/api/permissions', method: 'post', handler: 'permissions.post.js' },
      { route: '/api/user-permissions', method: 'get', handler: 'user-permissions.get.js' },
    ]
    for (const h of permissionHandlers) {
      addServerHandler({
        method: h.method as 'get' | 'post' | 'put' | 'delete',
        route: h.route,
        handler: resolve(`./runtime/server/api/${h.handler}`)
      })
    }
    // 2. File Management APIs
    // Middleware for root directory injection
    addServerHandler({
      route: '/api/images-list',
      middleware: true,
      handler: resolve('./runtime/server/api/_inject-rootdir.js')
    })

    // File operations handlers
    const fileHandlers = [
      { method: 'get', route: '/api/images-list', handler: 'images-list.get.js' },
      { method: 'post', route: '/api/images-list', handler: 'images-list.post.js' },
      { method: 'delete', route: '/api/images-list/:id', handler: 'images-list.delete.js' }
    ]

    for (const h of fileHandlers) {
      addServerHandler({
        method: h.method as 'get' | 'post' | 'delete',
        route: h.route,
        handler: resolve(`./runtime/server/api/${h.handler}`)
      })
    }

    /**
     * E) Logging System Configuration
     */

    // 1. User Behavior Logging
    if (options.logBehavior) {
      // Client-side logging plugins
      const behaviorLogPlugins = [
        'axios-logger.client.js',
        'router-logger.client.js'
      ].forEach(plugin => {
        addPlugin({
          src: resolve(`./runtime/plugins/${plugin}`),
          mode: 'client',
        })
      })

      // API handlers for logs
      const logHandlers = [
        { method: 'post' as const, route: '/api/logs', handler: 'logs.post.ts' },
        { method: 'get' as const, route: '/api/logs', handler: 'logs.get.ts' }
      ]

      for (const h of logHandlers) {
        addServerHandler({
          method: h.method,
          route: h.route,
          handler: resolve(`./runtime/server/api/${h.handler}`),
        })
      }

      // Add logs page
      extendPages((pages) => {
        pages.push({
          name: 'logs',
          path: '/logs',
          file: resolve('./runtime/pages/logs.vue'),
        })
      })
    }

    // 2. Error Logging
    if (options.logErrors) {
      // Error logging plugins
      const errorLogPlugins = [
        'router-vue-logger.client.ts',
        'axios-logger.client.ts'
      ].forEach(plugin => {
        addPlugin({
          src: resolve(`./runtime/plugins/${plugin}`),
          mode: 'client',
        })
      })

      // API handlers for error logs
      const errorLogHandlers = [
        { method: 'post' as const, route: '/api/error-logs', handler: 'error-logs.post.ts' },
        { method: 'get' as const, route: '/api/error-logs', handler: 'error-logs.get.ts' }
      ]

      for (const h of errorLogHandlers) {
        addServerHandler({
          method: h.method,
          route: h.route,
          handler: resolve(`./runtime/server/api/${h.handler}`),
        })
      }

      // Add error logs page
      extendPages((pages) => {
        pages.push({
          name: 'errorsLog',
          path: '/errorsLog',
          file: resolve('./runtime/pages/errorsLog.vue'),
        })
      })
    }
    extendPages((pages) => {
      const permissionsToSeed = []

      for (const page of pages) {
        const path = page.path
        const module = path.split('/')[1] || 'root'

        const key = `${module}.view`
        permissionsToSeed.push({
          key,
          module,
          action: 'view'
        })
      }

      // حالا: ارسال به DB فقط برای permissionهایی که وجود ندارن
      import('@prisma/client').then(async ({ PrismaClient }) => {
        const prisma = new PrismaClient()
        for (const perm of permissionsToSeed) {
          try {
            await prisma.permission.upsert({
              where: { key: perm.key },
              update: {},
              create: perm
            })
          } catch (e) {
            console.warn('⚠️ Permission creation failed:', e.message)
          }
        }
      })
    })

    // این فایل logs.post.ts در مسیر runtime/server/api/logs.post.ts قرار دارد
    // و باید محتوای آن همان کدی باشد که با Prisma یا دسترسی مستقیم به دیتابیس،
    // اطلاعات لاگ را در جدول UserLog ذخیره می‌کند.
    // مثلاً:
    //   import { defineEventHandler, readBody, getRequestHeader } from 'h3'
    //   import { prisma } from '../utils/db'
    //   export default defineEventHandler(async (event) => { … prisma.userLog.create({ data: { … } }) })
    // ———————————————
  },
})
