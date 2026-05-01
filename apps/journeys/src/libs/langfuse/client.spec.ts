import { type MockInstance } from 'vitest'

const mockLangfuseConstructor = vi.fn()

vi.mock('langfuse', () => ({
  Langfuse: mockLangfuseConstructor
}))

describe('langfuse client', () => {
  const ORIGINAL_ENV = process.env
  let warnSpy: MockInstance

  beforeEach(() => {
    vi.resetModules()
    mockLangfuseConstructor.mockClear()
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    process.env = { ...ORIGINAL_ENV }
    delete process.env.LANGFUSE_PUBLIC_KEY
    delete process.env.LANGFUSE_SECRET_KEY
    delete process.env.LANGFUSE_BASE_URL
    delete process.env.VERCEL_ENV
  })

  afterEach(() => {
    warnSpy.mockRestore()
    process.env = ORIGINAL_ENV
  })

  describe('getActivePromptLabel', () => {
    it("returns 'production' when VERCEL_ENV is 'production'", async () => {
      process.env.VERCEL_ENV = 'production'
      // eslint-disable-next-line import/dynamic-import-chunkname
      const { getActivePromptLabel } = await import('./client')
      expect(getActivePromptLabel()).toBe('production')
    })

    it("returns 'development' when VERCEL_ENV is unset", async () => {
      // eslint-disable-next-line import/dynamic-import-chunkname
      const { getActivePromptLabel } = await import('./client')
      expect(getActivePromptLabel()).toBe('development')
    })

    it("returns 'development' for any non-production VERCEL_ENV", async () => {
      process.env.VERCEL_ENV = 'preview'
      // eslint-disable-next-line import/dynamic-import-chunkname
      const { getActivePromptLabel } = await import('./client')
      expect(getActivePromptLabel()).toBe('development')
    })
  })

  describe('getLangfuse', () => {
    it('returns null when LANGFUSE_PUBLIC_KEY is missing', async () => {
      process.env.LANGFUSE_SECRET_KEY = 'sk'
      process.env.LANGFUSE_BASE_URL = 'https://lf.test'
      // eslint-disable-next-line import/dynamic-import-chunkname
      const { getLangfuse } = await import('./client')
      expect(getLangfuse()).toBeNull()
      expect(mockLangfuseConstructor).not.toHaveBeenCalled()
      expect(warnSpy).toHaveBeenCalledTimes(1)
    })

    it('returns null when LANGFUSE_SECRET_KEY is missing', async () => {
      process.env.LANGFUSE_PUBLIC_KEY = 'pk'
      process.env.LANGFUSE_BASE_URL = 'https://lf.test'
      // eslint-disable-next-line import/dynamic-import-chunkname
      const { getLangfuse } = await import('./client')
      expect(getLangfuse()).toBeNull()
      expect(warnSpy).toHaveBeenCalledTimes(1)
    })

    it('returns null when LANGFUSE_BASE_URL is missing', async () => {
      process.env.LANGFUSE_PUBLIC_KEY = 'pk'
      process.env.LANGFUSE_SECRET_KEY = 'sk'
      // eslint-disable-next-line import/dynamic-import-chunkname
      const { getLangfuse } = await import('./client')
      expect(getLangfuse()).toBeNull()
      expect(warnSpy).toHaveBeenCalledTimes(1)
    })

    it('returns null when an env var is set to an empty string', async () => {
      process.env.LANGFUSE_PUBLIC_KEY = ''
      process.env.LANGFUSE_SECRET_KEY = 'sk'
      process.env.LANGFUSE_BASE_URL = 'https://lf.test'
      // eslint-disable-next-line import/dynamic-import-chunkname
      const { getLangfuse } = await import('./client')
      expect(getLangfuse()).toBeNull()
      expect(mockLangfuseConstructor).not.toHaveBeenCalled()
    })

    it('warns only once across repeated calls when env vars missing', async () => {
      // eslint-disable-next-line import/dynamic-import-chunkname
      const { getLangfuse } = await import('./client')
      getLangfuse()
      getLangfuse()
      getLangfuse()
      expect(warnSpy).toHaveBeenCalledTimes(1)
    })

    it('constructs Langfuse with credentials when all env vars are set', async () => {
      process.env.LANGFUSE_PUBLIC_KEY = 'pk-test'
      process.env.LANGFUSE_SECRET_KEY = 'sk-test'
      process.env.LANGFUSE_BASE_URL = 'https://lf.test'
      // eslint-disable-next-line import/dynamic-import-chunkname
      const { getLangfuse } = await import('./client')
      const client = getLangfuse()
      expect(client).not.toBeNull()
      expect(mockLangfuseConstructor).toHaveBeenCalledTimes(1)
      expect(mockLangfuseConstructor).toHaveBeenCalledWith({
        publicKey: 'pk-test',
        secretKey: 'sk-test',
        baseUrl: 'https://lf.test'
      })
    })

    it('returns the same cached instance on repeated calls', async () => {
      process.env.LANGFUSE_PUBLIC_KEY = 'pk'
      process.env.LANGFUSE_SECRET_KEY = 'sk'
      process.env.LANGFUSE_BASE_URL = 'https://lf.test'
      // eslint-disable-next-line import/dynamic-import-chunkname
      const { getLangfuse } = await import('./client')
      const first = getLangfuse()
      const second = getLangfuse()
      expect(first).toBe(second)
      expect(mockLangfuseConstructor).toHaveBeenCalledTimes(1)
    })
  })

  describe('APOLOGIST_PROMPT_NAME', () => {
    it('is the stable identifier the handler sends to langfuse.getPrompt', async () => {
      // eslint-disable-next-line import/dynamic-import-chunkname
      const { APOLOGIST_PROMPT_NAME } = await import('./client')
      expect(APOLOGIST_PROMPT_NAME).toBe('apologist-world-cup-chat')
    })
  })
})
