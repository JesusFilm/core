import { AsyncLocalStorage } from 'node:async_hooks'

import { z } from 'zod'

export const permissionEffectSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('shortLinkDelete'),
    shortLinkIds: z.array(z.string())
  }),
  z.object({
    type: z.literal('teamRemoved'),
    teamName: z.string(),
    userId: z.string()
  })
])

export const permissionEffectsScope = new AsyncLocalStorage<
  Array<z.infer<typeof permissionEffectSchema>>
>()

/** Capture the exact effect before deleting the rows needed to reconstruct it. */
export function capturePermissionEffect(
  effect: z.infer<typeof permissionEffectSchema>
): boolean {
  const effects = permissionEffectsScope.getStore()
  if (!effects) return false
  effects.push(effect)
  return true
}
