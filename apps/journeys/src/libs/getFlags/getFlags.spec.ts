import { getFlags } from './getFlags'

describe('getFlags', () => {
  it('returns apologistChat as true for Stage environment', async () => {
    if (!process.env.LAUNCH_DARKLY_SDK_KEY) {
      // Skip gracefully in local dev where the SDK key is not configured.
      // This test runs as a live check in CI with real env vars.
      console.warn('Skipping live LD test: LAUNCH_DARKLY_SDK_KEY is not set')
      return
    }
    const flags = await getFlags()
    expect(flags.apologistChat).toBe(true)
  })
})
