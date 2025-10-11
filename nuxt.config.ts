import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  // Configuration for module builder to externalize dependencies and prevent implicit bundling
  rollupConfig: {
    external: [
      'execa',
      '@prisma/client',
      'cross-spawn',
      'strip-final-newline',
      'npm-run-path',
      'onetime',
      'human-signals',
      'is-stream',
      'get-stream',
      'merge-stream',
      'signal-exit',
      'path-key',
      'mimic-fn',
      '#main-entry-point',
      '@prisma/client/runtime/library.js',
      'which',
      'shebang-command',
      'isexe',
      'shebang-regex'
    ]
  }
})
