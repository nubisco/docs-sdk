import type { Ref } from 'vue'
import { computed, useSlots } from 'vue'
import ContentTab from './ContentTab.vue'

export function useTabLabels(): Ref<string[]> {
  const slots = useSlots()
  const tabLabels = computed(() => {
    const defaultSlot = slots.default?.()
    if (!defaultSlot) {
      return []
    }

    return (
      defaultSlot
        // By name as well as identity: a page that imports ContentTab by path
        // can load a second copy of the module, and identity alone would then
        // find no tabs at all.
        .filter(
          (vnode) =>
            (vnode.type === ContentTab ||
              (vnode.type as { __name?: string } | null)?.__name ===
                'ContentTab') &&
            vnode.props,
        )
        .map((vnode) => vnode.props?.label)
    )
  })
  return tabLabels
}
