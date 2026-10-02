import { vi } from 'vitest'

import {
  assertHostnameAllowed,
  getInfrastructureConfig,
  isHostnameAllowed,
  requireInfrastructureConfig
} from './config'

vi.mock('cloudflare/shims/web', () => ({}))
vi.mock('cloudflare', () => ({
  // Vitest 4 constructor mocks must be `function`s (docs/agents/testing.md)
  default: vi.fn(function () {
    return {}
  })
}))

describe('infrastructure config', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      CLOUDFLARE_ACCOUNT_ID: 'account',
      CLOUDFLARE_SHORT_LINKS_WORKER_NAME: 'short-links-redirect-stage',
      CLOUDFLARE_SHORT_LINKS_INFRA_API_TOKEN: 'infra-token',
      CLOUDFLARE_SHORT_LINKS_ALLOWED_HOSTNAMES:
        'stage.jesus.film, Stage.Jesus.Movie'
    }
    delete process.env.CLOUDFLARE_SHORT_LINKS_API_BASE_URL
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('is configured by the Worker name, the infra token and the account', () => {
    expect(getInfrastructureConfig()).toMatchObject({
      accountId: 'account',
      workerName: 'short-links-redirect-stage',
      allowedHostnames: ['stage.jesus.film', 'stage.jesus.movie']
    })
  })

  it.each([
    'CLOUDFLARE_SHORT_LINKS_WORKER_NAME',
    'CLOUDFLARE_SHORT_LINKS_INFRA_API_TOKEN',
    'CLOUDFLARE_ACCOUNT_ID'
  ])('is off when %s is unset', (name) => {
    delete process.env[name]

    expect(getInfrastructureConfig()).toBeNull()
    expect(() => requireInfrastructureConfig()).toThrow(
      'Cloudflare infrastructure management is not configured in this environment'
    )
  })

  it('is off in local dev, where publishing points at the local Worker', () => {
    process.env.CLOUDFLARE_SHORT_LINKS_API_BASE_URL =
      'http://localhost:8788/client/v4'

    expect(getInfrastructureConfig()).toBeNull()
  })

  it('only allows the hostnames the environment lists', () => {
    const config = requireInfrastructureConfig()

    expect(isHostnameAllowed(config, 'Stage.Jesus.Film')).toBe(true)
    expect(isHostnameAllowed(config, 'jesus.film')).toBe(false)
    expect(() => assertHostnameAllowed(config, 'jesus.film')).toThrow(
      'jesus.film is not in the hostnames this environment may set up on Cloudflare'
    )
  })

  it('allows nothing when the list is unset', () => {
    delete process.env.CLOUDFLARE_SHORT_LINKS_ALLOWED_HOSTNAMES

    expect(isHostnameAllowed(requireInfrastructureConfig(), 'jesus.film')).toBe(
      false
    )
  })
})
