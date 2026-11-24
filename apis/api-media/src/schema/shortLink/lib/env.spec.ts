import { readShortLinksEnv } from './env'

describe('readShortLinksEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('SHORT_LINKS_ALLOW_LOCAL_DESTINATIONS', () => {
    it('throws, naming the variable, when set to "true" under NODE_ENV=production', () => {
      vi.stubEnv('NODE_ENV', 'production')
      vi.stubEnv('SHORT_LINKS_ALLOW_LOCAL_DESTINATIONS', 'true')
      expect(() => readShortLinksEnv()).toThrow(
        /SHORT_LINKS_ALLOW_LOCAL_DESTINATIONS=true is for local development only/
      )
    })

    it('throws under NODE_ENV=production even with SKIP_ENV_VALIDATION=1', () => {
      vi.stubEnv('SKIP_ENV_VALIDATION', '1')
      vi.stubEnv('NODE_ENV', 'production')
      vi.stubEnv('SHORT_LINKS_ALLOW_LOCAL_DESTINATIONS', 'true')
      expect(() => readShortLinksEnv()).toThrow(
        /SHORT_LINKS_ALLOW_LOCAL_DESTINATIONS=true is for local development only/
      )
    })

    it('reads "true" outside production', () => {
      vi.stubEnv('NODE_ENV', 'development')
      vi.stubEnv('SHORT_LINKS_ALLOW_LOCAL_DESTINATIONS', 'true')
      expect(readShortLinksEnv().SHORT_LINKS_ALLOW_LOCAL_DESTINATIONS).toBe(
        'true'
      )
    })

    it('boots in production when unset or "false"', () => {
      vi.stubEnv('NODE_ENV', 'production')
      vi.stubEnv('SHORT_LINKS_ALLOW_LOCAL_DESTINATIONS', undefined)
      expect(
        readShortLinksEnv().SHORT_LINKS_ALLOW_LOCAL_DESTINATIONS
      ).toBeUndefined()
      vi.stubEnv('SHORT_LINKS_ALLOW_LOCAL_DESTINATIONS', 'false')
      expect(readShortLinksEnv().SHORT_LINKS_ALLOW_LOCAL_DESTINATIONS).toBe(
        'false'
      )
    })
  })
})
