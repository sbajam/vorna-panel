// src/runtime/composables/badge.ts
import { ref, inject, type Ref, type ComputedRef } from 'vue'
import { useNuxtApp } from '#app'

export type BadgeValue = string | number | null | undefined
export type BadgeSource =
  | Ref<BadgeValue>
  | ComputedRef<BadgeValue>
  | (() => BadgeValue | Promise<BadgeValue>)

export const BadgeRegistryKey = Symbol('vorna:badge-registry')

export type Registry = {
  map: Map<string, BadgeSource>
  register: (key: string, source: BadgeSource) => void
  resolve: (key: string) => Ref<BadgeValue>
}

export function makeRegistry(): Registry {
  const map = new Map<string, BadgeSource>()

  function register(key: string, source: BadgeSource) {
    map.set(key, source)
  }

  function resolve(key: string): Ref<BadgeValue> {
    const src = map.get(key)
    if (!src) return ref<BadgeValue>(null)
    if (typeof src === 'object' && src !== null && 'value' in src) {
      return src as Ref<BadgeValue>
    }
    const out = ref<BadgeValue>(null)
    ;(async () => {
      try {
        const v = await (src as Function)()
        out.value = v as BadgeValue
      } catch {}
    })()
    return out
  }

  return { map, register, resolve }
}

export function useBadgeRegistry(): Registry {
  const nuxt = useNuxtApp()
  const fromNuxt = nuxt.$badgeRegistry as Registry | undefined
  if (fromNuxt) return fromNuxt

  const fromInject = inject<Registry>(BadgeRegistryKey as any)
  if (fromInject) return fromInject

  throw new Error('[badges] Badge registry is not installed. Load the registry plugin first.')
}

export function defineVornaBadge(key: string, source: BadgeSource) {
  const nuxt = useNuxtApp()
  const reg = nuxt.$badgeRegistry as Registry | undefined
  if (!reg) throw new Error('[badges] Badge registry is not available. Load the registry plugin first.')
  reg.register(key, source)
}
