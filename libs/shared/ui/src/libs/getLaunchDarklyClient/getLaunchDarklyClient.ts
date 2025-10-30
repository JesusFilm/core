import { LDClient, LDUser, init } from '@launchdarkly/node-server-sdk'

let launchDarklyClient: LDClient

/**
 * This requires the LAUNCH_DARKLY_SDK_KEY environment variable to be set.
 * @returns a LaunchDarkly server-side client as a singleton, or a stub client if initialization fails or times out.
 */
export async function getLaunchDarklyClient(user?: LDUser): Promise<LDClient> {
  if (launchDarklyClient == null) {
    launchDarklyClient = init(process.env.LAUNCH_DARKLY_SDK_KEY ?? '')
  }

  try {
    await Promise.race([
      launchDarklyClient.waitForInitialization({ timeout: 1000 }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('LaunchDarkly initialization timeout')),
          1000
        )
      )
    ])

    if (user != null) launchDarklyClient.identify(user)

    return launchDarklyClient
  } catch (error) {
    console.warn(
      'LaunchDarkly client initiation failed or timed out, using stub client:',
      error
    )

    const stubClient = {
      waitForInitialization: async () => Promise.resolve(),
      identify: (user: LDUser) => ({}),
      allFlagsState: () => ({
        valid: false,
        allValues: {},
        toJSON: () => ({})
      })
    } as unknown as LDClient

    return stubClient
  }
}
