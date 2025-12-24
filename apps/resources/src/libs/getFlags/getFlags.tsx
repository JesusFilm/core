import { v4 as uuidv4 } from 'uuid'

import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'

export async function getFlags(): Promise<{
  [key: string]: boolean | undefined
}> {
  const launchDarklyClient = await getLaunchDarklyClient()

  const flags = (
    await launchDarklyClient.allFlagsState({ key: uuidv4(), anonymous: true })
  ).toJSON() as {
    [key: string]: boolean | undefined
  }

  return flags
}
