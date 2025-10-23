import { LDClient, LDUser, init } from 'launchdarkly-node-server-sdk'

let launchDarklyClient: LDClient

/**
 * Simple stub client that returns empty objects for flag methods
 * Used as fallback when LaunchDarkly initialization fails or times out
 */
const createStubClient = (): LDClient => {
  return {
    waitForInitialization: async () => Promise.resolve(),
    identify: (user: LDUser) => {
      // Stub implementation - no-op
    },
    allFlagsState: () => ({
      valid: false,
      allValues: {},
      toJSON: () => ({})
    })
  } as unknown as LDClient
}

/**
 * This requires the LAUNCH_DARKLY_SDK_KEY environment variable to be set.
 * @returns a LaunchDarkly server-side client as a singleton, or a stub client if initialization fails or times out.
 */
export async function getLaunchDarklyClient(user?: LDUser): Promise<LDClient> {
  if (launchDarklyClient == null) {
    launchDarklyClient = init(process.env.LAUNCH_DARKLY_SDK_KEY ?? '')
  }

  try {
    // Use Promise.race to implement 1-second timeout
    await Promise.race([
      launchDarklyClient.waitForInitialization(),
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
    // Return stub client if initialization fails or times out
    console.warn(
      'LaunchDarkly client initiaation failed or timed out, using stub client:',
      error
    )
    return createStubClient()
  }
}
