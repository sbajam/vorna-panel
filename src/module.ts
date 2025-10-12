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

import {
  defineNuxtModule,
  createResolver,
  extendPages,
  addLayout,
  installModule,
  addComponent,
  addPlugin,
  addImportsDir,
  addServerHandler,
  addRouteMiddleware
} from '@nuxt/kit'
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
  font?: string // Vazir, IranSans, Roya
  baseUrl?: string
  notifications?: string
  logBehavior?: boolean // Enable behavior logging (PAGE_VIEW, API_REQUEST)
  logErrors?: boolean // Enable error logging
  superAdmins?: string[]
  guestRoutes?: string[] // Routes accessible to guest users
  isLoginRoute?: string
  authType: string // version1, version2, custom
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@VornaCo/vorna-panel',
    configKey: 'vornaPanel',
    compatibility: { nuxt: '^4.0.0' },
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
    logBehavior: true,
    logErrors: true,

    // Access control
    superAdmins: ['admin'],
    guestRoutes: ['/login', '/403', '/404'],
    isLoginRoute: 'is-login',
    authType: 'version1'
  },

  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // Database & Prisma Setup
    const moduleSchema = resolve('./runtime/prisma/schema.prisma')
    if (process.env.PRISMA_AUTO_GENERATE === 'true') {
      nuxt.hook('build:before', () => {
        execaSync('npx', ['prisma', 'generate', `--schema=${moduleSchema}`], {
          cwd: nuxt.options.rootDir,
          stdio: 'inherit'
        })
        execaSync('npx', ['prisma', 'db', 'push', `--schema=${moduleSchema}`], {
          cwd: nuxt.options.rootDir,
          stdio: 'inherit'
        })
      })
    }

    // Nitro & Runtime Configuration
    nuxt.hook('nitro:config', (config) => {
      config.routeRules = {
        ...(config.routeRules || {}),
        '/api/images-list': { bodyParser: false } as any
      }
      config.publicAssets = [
        ...(config.publicAssets || []),
        {
          dir: path.resolve(nuxt.options.rootDir, 'public', 'uploads'),
          baseURL: '/uploads',
          maxAge: 60 * 60 * 24 * 30 // 30 days
        }
      ]
    })

    nuxt.options.runtimeConfig.private = defu(
      nuxt.options.runtimeConfig.private,
      {
        vornaPanel: {
          rootDir: nuxt.options.rootDir
        }
      }
    )

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
        isLoginRoute: options.isLoginRoute,
        authType: options.authType,
      }
    )

    // Install and configure Tailwind
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

    // Build transpile
    nuxt.options.build!.transpile.push('moment')
    nuxt.options.build!.transpile.push('moment-jalaali')
    nuxt.options.build!.transpile.push('vue3-persian-datetime-picker')
    nuxt.options.build.transpile ||= []
    nuxt.options.build.transpile.push('vue3-grid-layout')

    // Vite optimize deps
    nuxt.options.vite.optimizeDeps ||= {}
    nuxt.options.vite.optimizeDeps.include ||= []
    nuxt.options.vite.optimizeDeps.exclude ||= [
      'execa',
      '@prisma/client',
      'cross-spawn',
      'strip-final-newline',
      'npm-run-path',
      'onetime',
      'signal-exit',
      'human-signals',
      'is-stream',
      'get-stream',
      'merge-stream',
      'mimic-fn',
      'path-key',
      'shebang-command',
      'which',
      'isexe',
      'shebang-regex'
    ]
    nuxt.options.vite.optimizeDeps.include.push('vue3-grid-layout')

    // Plugins
    addPlugin(resolve('./runtime/plugins/datepicker.client.js'))
    addPlugin(resolve('./runtime/plugins/notifications.js'))
    addPlugin(resolve('./runtime/plugins/auto-animate.client.js'))
    addPlugin({
      src: resolve('./runtime/plugins/vue-apexcharts.client.js'),
      mode: 'client',
    })

    // CSS
    nuxt.options.css.unshift(resolve('./runtime/assets/admin.scss'))
    nuxt.options.css.unshift(resolve('./runtime/assets/font.scss'))

    // Aliases
    nuxt.options.alias['~vorna-stores'] = resolve('./runtime/stores')

    // Auto imports
    addImportsDir(resolve('./runtime/composables'))
    addImportsDir(resolve('./runtime/middleware'))
    addImportsDir(resolve('./runtime/stores'))

    // Router middleware
    nuxt.options.router.middleware ||= []
    nuxt.options.router.middleware.push('check-auth.global')
    addRouteMiddleware({
      name: 'check-auth',
      path: resolve('./runtime/middleware/check-auth.global.ts'),
      global: true
    })

    // Pages
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
      pages.push({
        name: 'access',
        path: '/access',
        file: resolve('./runtime/pages/access.vue')
      })
      pages.push({
        name: 'formBuilder',
        path: '/formBuilder',
        file: resolve('./runtime/pages/formBuilder.vue'),
      })
      pages.push({
        name: 'tableBuilder',
        path: '/tableBuilder',
        file: resolve('./runtime/pages/tableBuilder.vue'),
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

    // Layouts
    const layouts = [
      { name: 'admin', file: 'admin.vue' },
      { name: 'builder', file: 'builder.vue' },
      { name: 'modal', file: 'modal.vue' }
    ]
    layouts.forEach(layout => {
      addLayout({
        src: resolve(`./runtime/layouts/${layout.file}`),
        filename: layout.file,
      })
    })

    // Components
    const layoutComponents = [
      { name: 'Sidebar', file: 'ui/Sidebar.vue' },
      { name: 'Header', file: 'ui/Header.vue' },
      { name: 'Box', file: 'ui/Box.vue' },
      { name: 'Breadcrumb', file: 'ui/Breadcrumb.vue' },
      { name: 'Tabs', file: 'ui/Tabs.vue' },
    ]

    const formComponents = [
      { name: 'InputField', file: 'form/InputField.vue' },
      { name: 'RadioGroup', file: 'form/RadioGroup.vue' },
      { name: 'CheckBoxGroup', file: 'form/CheckBoxGroup.vue' },
      { name: 'ToggleSwitch', file: 'form/ToggleSwitch.vue' },
      { name: 'DropDown', file: 'form/DropDown.vue' },
      { name: 'Editor', file: 'form/Editor.vue' },
      { name: 'TagsField', file: 'form/TagsField.vue' },
      { name: 'FileField', file: 'form/FileField.vue' },
      { name: 'RichTextField', file: 'form/RichTextField.vue' },
    ]

    const formBuilderComponents = [
      { name: 'FormBuilder', file: 'form/builder/FormBuilder.vue' },
      { name: 'FieldArray', file: 'form/builder/FieldArray.vue' },
      { name: 'PropertiesPanel', file: 'form/builder/PropertiesPanel.vue' },
      { name: 'FieldPalette', file: 'form/builder/FieldPalette.vue' },
      { name: 'FormSettingsPanel', file: 'form/builder/FormSettingsPanel.vue' },
      { name: 'SectionSettingsPanel', file: 'form/builder/SectionSettingsPanel.vue' }
    ]

    const mediaComponents = [
      { name: 'ImageUploader', file: 'form/ImageUploader.vue' },
      { name: 'FileUploader', file: 'form/FileUploader.vue' },
      { name: 'ImageP', file: 'form/ImageP.vue' }
    ]

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

    const ticketsComponents = [
      { name: 'QuestionDetails', file: 'tickets/QuestionDetails.vue' },
    ]

    const loginComponents = [
      { name: 'LoginV1', file: 'login/LoginV1.vue' },
      { name: 'LoginV2', file: 'login/LoginV2.vue' },
    ]

    const allComponents = [
      ...layoutComponents,
      ...formComponents,
      ...formBuilderComponents,
      ...mediaComponents,
      ...utilComponents,
      ...dashboardComponents,
      ...ticketsComponents,
      ...loginComponents
    ]

    allComponents.forEach(component => {
      addComponent({
        filePath: resolve(`./runtime/components/${component.file}`),
        name: component.name,
      })
    })

    // Modules
    await installModule('@tailvue/nuxt')
    await installModule('@nuxt/icon')

    // API Routes
    const roleHandlers = [
      { route: '/api/roles', method: 'get', handler: 'roles.get.js' },
      { route: '/api/roles', method: 'post', handler: 'roles.post.js' },
      { route: '/api/roles/:id', method: 'put', handler: 'roles.put.js' },
      { route: '/api/roles/:id', method: 'delete', handler: 'roles.delete.js' },
    ]
    roleHandlers.forEach(h => {
      addServerHandler({
        route: h.route,
        method: h.method as 'get' | 'post' | 'put' | 'delete',
        handler: resolve(`./runtime/server/api/${h.handler}`)
      })
    })

    const permissionHandlers = [
      { route: '/api/permissions', method: 'get', handler: 'permissions.get.js' },
      { route: '/api/permissions', method: 'post', handler: 'permissions.post.js' },
      { route: '/api/user-permissions', method: 'get', handler: 'user-permissions.get.js' },
    ]
    permissionHandlers.forEach(h => {
      addServerHandler({
        method: h.method as 'get' | 'post' | 'put' | 'delete',
        route: h.route,
        handler: resolve(`./runtime/server/api/${h.handler}`)
      })
    })

    // File Management APIs
    addServerHandler({
      route: '/api/images-list',
      middleware: true,
      handler: resolve('./runtime/server/api/_inject-rootdir.js')
    })

    const fileHandlers = [
      { method: 'get', route: '/api/images-list', handler: 'images-list.get.js' },
      { method: 'post', route: '/api/images-list', handler: 'images-list.post.js' },
      { method: 'delete', route: '/api/images-list/:id', handler: 'images-list.delete.js' }
    ]
    fileHandlers.forEach(h => {
      addServerHandler({
        method: h.method as 'get' | 'post' | 'delete',
        route: h.route,
        handler: resolve(`./runtime/server/api/${h.handler}`)
      })
    })

    // Logging System
    if (options.logBehavior) {
      const behaviorLogPlugins = [
        'axios-logger.client.js',
        'router-logger.client.js'
      ]
      behaviorLogPlugins.forEach(plugin => {
        addPlugin({
          src: resolve(`./runtime/plugins/${plugin}`),
          mode: 'client',
        })
      })

      const logHandlers = [
        { method: 'post' as const, route: '/api/logs', handler: 'logs.post.js' },
        { method: 'get' as const, route: '/api/logs', handler: 'logs.get.js' }
      ]
      logHandlers.forEach(h => {
        addServerHandler({
          method: h.method,
          route: h.route,
          handler: resolve(`./runtime/server/api/${h.handler}`),
        })
      })

      extendPages((pages) => {
        pages.push({
          name: 'logs',
          path: '/logs',
          file: resolve('./runtime/pages/logs.vue'),
        })
      })
    }

    if (options.logErrors) {
      const errorLogPlugins = [
        'router-vue-logger.client.js',
        'axios-logger.client.js'
      ]
      errorLogPlugins.forEach(plugin => {
        addPlugin({
          src: resolve(`./runtime/plugins/${plugin}`),
          mode: 'client',
        })
      })

      const errorLogHandlers = [
        { method: 'post' as const, route: '/api/error-logs', handler: 'error-logs.post.js' },
        { method: 'get' as const, route: '/api/error-logs', handler: 'error-logs.get.js' }
      ]
      errorLogHandlers.forEach(h => {
        addServerHandler({
          method: h.method,
          route: h.route,
          handler: resolve(`./runtime/server/api/${h.handler}`),
        })
      })
      errorLogHandlers.forEach(h => {
        addServerHandler({
          method: h.method,
          route: h.route,
          handler: resolve(`./runtime/server/api/${h.handler}`),
        })
      })

      const authenticationHandler = [
        { method: 'post' as const, route: '/api/auth/login', handler: 'auth/login.post.js' },
        { method: 'post' as const, route: '/api/auth/refresh', handler: 'auth/refresh.post.js' }
      ]
      authenticationHandler.forEach(h => {
        addServerHandler({
          method: h.method,
          route: h.route,
          handler: resolve(`./runtime/server/api/${h.handler}`),
        })
      })

      extendPages((pages) => {
        pages.push({
          name: 'errorsLog',
          path: '/errorsLog',
          file: resolve('./runtime/pages/errorsLog.vue'),
        })
      })
    }

    // Permission seeding
    extendPages((pages) => {
      const permissionsToSeed = []
      pages.forEach(page => {
        const path = page.path
        const module = path.split('/')[1] || 'root'
        const key = `${module}.view`
        permissionsToSeed.push({
          key,
          module,
          action: 'view'
        })
      })

      import('@prisma/client').then(async ({ PrismaClient }) => {
        const prisma = new PrismaClient()
        permissionsToSeed.forEach(async (perm) => {
          try {
            await prisma.permission.upsert({
              where: { key: perm.key },
              update: {},
              create: perm
            })
          } catch (e) {
            console.warn('⚠️ Permission creation failed:', e.message)
          }
        })
      })
    })
  },
})
