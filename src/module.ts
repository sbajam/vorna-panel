// src/module.ts
import { defineNuxtModule, createResolver, extendPages, addLayout, installModule, addComponent, addPlugin, addImportsDir, addServerHandler } from '@nuxt/kit'
import { defu } from 'defu'

export interface ModuleOptions {
  name?: string
  menuItems?: Array<object>
  logo?: string
  showOnlineStatus?: boolean
  font?: string// Vazir , IranSans , Roya
  baseUrl?: string,
  notifications?: String

}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@VornaCo/vorna-panel',
    configKey: 'vornaPanel',
    compatibility: { nuxt: '^3.0.0' },
  },
  defaults: {
    name: 'پنل مدیریت',
    menuItems: [],
    logo: '../logo.png',
    showOnlineStatus: true,
    font: 'Vazir',
    notifications: 'toast',
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    nuxt.options.nitro = defu(nuxt.options.nitro, {
      routeRules: {
        // دقیقا همین مسیر رو multipart-ready کن
        '/api/images-list': { bodyParser: false }
        // یا اگر خواستی روی همه‌ی api ها:
        // '/api/**': { bodyParser: false }
      }
    })
    // Merge کردن اسم در runtimeConfig
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

    // اضافه کردن فایل SCSS
    nuxt.options.css.unshift(resolve('./runtime/assets/admin.scss'))
    nuxt.options.css.unshift(resolve('./runtime/assets/font.scss'))
    nuxt.options.alias['~vorna-stores'] = resolve('./runtime/stores')

    addImportsDir(resolve('./runtime/composables'))
    addImportsDir(resolve('./runtime/stores'))

    addLayout({
      src: resolve('./runtime/layouts/admin.vue'),
      filename: 'admin.vue',
    })
    addLayout({
      src: resolve('./runtime/layouts/modal.vue'),
      filename: 'modal.vue',
    })
    addComponent({
      filePath: resolve('./runtime/components/Sidebar.vue'),
      name: 'Sidebar',
    })
    addComponent({
      filePath: resolve('./runtime/components/Header.vue'),
      name: 'Header',
    })
    addComponent({
      filePath: resolve('./runtime/components/Box.vue'),
      name: 'Box',
    })
    addComponent({
      filePath: resolve('./runtime/components/SmartTable.vue'),
      name: 'SmartTable',
    })
    addComponent({
      filePath: resolve('./runtime/components/Spinner.vue'),
      name: 'Spinner',
    })
    addComponent({
      filePath: resolve('./runtime/components/Button.vue'),
      name: 'Button',
    })
    addComponent({
      filePath: resolve('./runtime/components/Breadcrumb.vue'),
      name: 'Breadcrumb',
    })
    addComponent({
      filePath: resolve('./runtime/components/DropDown.vue'),
      name: 'DropDown',
    })
    addComponent({
      filePath: resolve('./runtime/components/Editor.vue'),
      name: 'Editor',
    })
    addComponent({
      filePath: resolve('./runtime/components/ImageUploader.vue'),
      name: 'ImageUploader',
    })
    addComponent({
      filePath: resolve('./runtime/components/ImageP.vue'),
      name: 'ImageP',
    })
    extendPages((pages) => {
      pages.push({
        name: 'hello',
        path: '/hello',
        file: resolve('./runtime/pages/hello.vue'),
      })
    })
    // اگر از toast استفاده می‌کنند، ماژول tailvue را نصب کن
    await installModule('@tailvue/nuxt')

    addPlugin(resolve('./runtime/plugins/notifications.js'))
    addPlugin(resolve('./runtime/plugins/pinia.js'))
    addServerHandler({
      method: 'GET',
      route: '/api/images-list',
      handler: resolve('./runtime/server/api/images-list.get.js')
    })
    addServerHandler({
      method: 'POST',
      route: '/api/images-list',
      handler: resolve('./runtime/server/api/images.post.js')
    })
    addServerHandler({
      method: 'DELETE',
      route: '/api/images-list/:id',
      handler: resolve('./runtime/server/api/images-list.delete.js')
    })
  },
})
