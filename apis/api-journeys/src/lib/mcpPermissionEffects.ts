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
  }),
  z.object({
    type: z.literal('journeyApproved'),
    notification: z.object({
      userId: z.string(),
      url: z.string(),
      journey: z.looseObject({
        id: z.string(),
        title: z.string(),
        primaryImageBlock: z
          .looseObject({ src: z.string().nullable() })
          .nullable()
      }),
      sender: z.looseObject({
        firstName: z.string(),
        lastName: z.string().optional(),
        email: z.string().nullable().optional(),
        imageUrl: z.string().nullable().optional()
      })
    })
  }),
  z.object({
    type: z.literal('templateSite'),
    templateId: z.string()
  })
])

export type JourneyApprovalNotification = Extract<
  z.infer<typeof permissionEffectSchema>,
  { type: 'journeyApproved' }
>['notification']

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
