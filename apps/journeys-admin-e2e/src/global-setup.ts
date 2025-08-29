import type { FullConfig } from '@playwright/test'

async function waitForHealthy(url: string, timeoutMs: number): Promise<void> {
  const start = Date.now()
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const response = await fetch(url, { method: 'GET' })
      if (response.ok) return
    } catch {}
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timed out waiting for ${url}`)
    }
    await new Promise((r) => setTimeout(r, 1000))
  }
}

export default async function globalSetup(config: FullConfig) {
  const baseURL =
    process.env.JOURNEYS_ADMIN_DAILY_E2E ??
    process.env.DEPLOYMENT_URL ??
    'http://localhost:4200'
  await waitForHealthy(baseURL, 120_000)
}
