import { LDClient, LDUser, init } from '@launchdarkly/node-server-sdk'

const stubClient = {
  waitForInitialization: async () => Promise.resolve(),
  identify: (user: LDUser) => ({}),
  allFlagsState: () => ({
    valid: false,
    allValues: {},
    toJSON: () => ({})
  })
} as unknown as LDClient

// 10s gives the SSE handshake room to complete on cold starts; 1s was losing
// the race and falling back to the stub client, which returns empty flags.
// Observed cold-start init in dev containers has reached ~5.4s, so 5s was
// still too tight.
const INIT_TIMEOUT_SECONDS = 10

// Cache on globalThis so the singleton survives Next.js HMR module re-evaluation
// in dev — a module-scoped `let` is reset on each API-route recompile, which
// spawns a fresh LDClient and restarts the init race on every hot reload.
const globalForLD = globalThis as typeof globalThis & {
  __launchDarklyClient?: LDClient
}

/**
 * This requires the LAUNCH_DARKLY_SDK_KEY environment variable to be set.
 * @returns a LaunchDarkly server-side client as a singleton, or a stub client if initialization fails or times out.
 */
export async function getLaunchDarklyClient(user?: LDUser): Promise<LDClient> {
  if (globalForLD.__launchDarklyClient == null) {
    globalForLD.__launchDarklyClient = init(
      process.env.LAUNCH_DARKLY_SDK_KEY ?? ''
    )
  }
  const launchDarklyClient = globalForLD.__launchDarklyClient

  try {
    await Promise.race([
      launchDarklyClient.waitForInitialization({
        timeout: INIT_TIMEOUT_SECONDS
      }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('LaunchDarkly initialization timeout')),
          INIT_TIMEOUT_SECONDS * 1000
        )
      )
    ])

    if (user != null) await launchDarklyClient.identify(user)

    return launchDarklyClient
  } catch (error) {
    console.warn(
      'LaunchDarkly client initiation failed or timed out, using stub client:',
      error
    )

    return stubClient
  }
}
