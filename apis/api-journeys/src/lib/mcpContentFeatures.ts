import { z } from 'zod'

import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'
import { auth } from '@core/yoga/firebaseClient'

/** Use the same current identity and flag targeting as the mounted Admin. */
export async function prepareCardChatGate(
  userId: string
): Promise<() => Promise<boolean>> {
  try {
    const identity = await auth.getUser(userId)
    const user = {
      key: identity.uid,
      firstName: identity.displayName,
      email: identity.email
    }
    const client = await getLaunchDarklyClient(user)
    return async () => {
      const flags = (await client.allFlagsState(user)).toJSON()
      return z.object({ aiChatEditor: z.literal(true) }).safeParse(flags)
        .success
    }
  } catch {
    return async () => false
  }
}
