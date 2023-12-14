import { LDClient, LDUser, init } from 'launchdarkly-node-server-sdk'

let launchDarklyClient: LDClient

/**
 * This requires the LAUNCH_DARKLY_SDK_KEY environment variable to be set.
 * @returns a LaunchDarkly server-side client as a singleton.
 */
export async function getLaunchDarklyClient(user?: LDUser): Promise<LDClient> {
  if (launchDarklyClient == null) {
    launchDarklyClient = init(process.env.LAUNCH_DARKLY_SDK_KEY ?? '')
  }

  await launchDarklyClient.waitForInitialization()

  if (user != null) launchDarklyClient.identify(user)

  return launchDarklyClient
}
