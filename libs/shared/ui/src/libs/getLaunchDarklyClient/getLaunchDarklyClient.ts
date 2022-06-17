import { init, LDClient } from 'launchdarkly-node-server-sdk'

let launchDarklyClient: LDClient

export async function getLaunchDarklyClient(): Promise<LDClient> {
  if (launchDarklyClient != null) return launchDarklyClient

  launchDarklyClient = init(process.env.LAUNCH_DARKLY_SDK_KEY ?? '')
  await launchDarklyClient.waitForInitialization()

  return launchDarklyClient
}
