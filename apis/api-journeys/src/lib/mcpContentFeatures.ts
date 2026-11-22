import { z } from 'zod'

import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'
import { auth } from '@core/yoga/firebaseClient'

/** Use the same current identity and flag targeting as the mounted Admin. */
export async function prepareEditorFeatureGate(
  userId: string
): Promise<
  (
    feature: 'aiChatEditor' | 'websiteMode' | 'editJourneyTrackingMetrics'
  ) => Promise<boolean>
> {
  try {
    const identity = await auth.getUser(userId)
    const user = {
      key: identity.uid,
      firstName: identity.displayName,
      email: identity.email
    }
    const client = await getLaunchDarklyClient(user)
    return async (feature) => {
      const flags = (await client.allFlagsState(user)).toJSON()
      const parsed = z.record(z.string(), z.unknown()).safeParse(flags)
      return parsed.success && parsed.data[feature] === true
    }
  } catch {
    return async () => false
  }
}

export async function prepareCardChatGate(
  userId: string
): Promise<() => Promise<boolean>> {
  const check = await prepareEditorFeatureGate(userId)
  return () => check('aiChatEditor')
}
