import { inject, provide, ref, computed, type Ref, type ComputedRef } from 'vue'

type BadgeValue = string | number | null | undefined
type BadgeSource =
  | Ref<BadgeValue>
  | ComputedRef<BadgeValue>
  | (() => BadgeValue | Promise<BadgeValue>)

const BadgeRegistryKey = Symbol('vorna:badge-registry')

type Registry = {
  map: Map<string, BadgeSource>
  register: (key: string, source: BadgeSource) => void
  resolve: (key: string) => Ref<BadgeValue> // همیشه یک ref واکنشی
}

function makeRegistry(): Registry {
  const map = new Map<string, BadgeSource>()

  const register = (key: string, source: BadgeSource) => {
    map.set(key, source)
  }

  const resolve = (key: string): Ref<BadgeValue> => {
    const src = map.get(key)
    if (!src) return ref<BadgeValue>(null)

    if (typeof src === 'object' && src !== null && 'value' in src) {
      return src as Ref<BadgeValue>
    }

    // فانکشن (sync/async)
    const out = ref<BadgeValue>(null)
    ;(async () => {
      try {
        const v = await (src as Function)()
        out.value = v as BadgeValue
      } catch { /* noop */ }
    })()
    return out
  }

  return { map, register, resolve }
}

export function provideBadgeRegistry() {
  const reg = makeRegistry()
  provide(BadgeRegistryKey, reg)
  return reg
}

export function useBadgeRegistry(): Registry {
  const reg = inject<Registry>(BadgeRegistryKey as any)
  return reg ?? makeRegistry() // fallback امن
}

// کمک برای پروژهٔ میزبان
export function defineVornaBadge(key: string, source: BadgeSource) {
  const reg = useBadgeRegistry()
  reg.register(key, source)
}
