import { DEFAULT_OPENROUTER_MODEL, parseEnv } from './env'

const validSource = {
  LANGFUSE_PUBLIC_KEY: 'pk-lf-123',
  LANGFUSE_SECRET_KEY: 'sk-lf-123',
  LANGFUSE_BASE_URL: 'https://cloud.langfuse.com',
  OPENROUTER_API_KEY: 'sk-or-123'
}

describe('parseEnv', () => {
  it('returns a typed config when all required vars are set', () => {
    const env = parseEnv(validSource)
    expect(env).toEqual({
      langfusePublicKey: 'pk-lf-123',
      langfuseSecretKey: 'sk-lf-123',
      langfuseBaseUrl: 'https://cloud.langfuse.com',
      openrouterApiKey: 'sk-or-123',
      openrouterModel: DEFAULT_OPENROUTER_MODEL
    })
  })

  it('throws naming the missing key when LANGFUSE_SECRET_KEY is absent', () => {
    const { LANGFUSE_SECRET_KEY, ...rest } = validSource
    expect(() => parseEnv(rest)).toThrow(/LANGFUSE_SECRET_KEY/)
  })

  it('throws naming the missing key when OPENROUTER_API_KEY is absent', () => {
    const { OPENROUTER_API_KEY, ...rest } = validSource
    expect(() => parseEnv(rest)).toThrow(/OPENROUTER_API_KEY/)
  })

  it('points at fetch-env.sh in the error message', () => {
    expect(() => parseEnv({})).toThrow(/fetch-env\.sh/)
  })

  it('rejects a non-URL LANGFUSE_BASE_URL', () => {
    expect(() =>
      parseEnv({ ...validSource, LANGFUSE_BASE_URL: 'not-a-url' })
    ).toThrow(/LANGFUSE_BASE_URL/)
  })

  it('exposes the default model when OPENROUTER_MODEL is unset', () => {
    expect(parseEnv(validSource).openrouterModel).toBe(DEFAULT_OPENROUTER_MODEL)
  })

  it('honours an explicit OPENROUTER_MODEL', () => {
    const env = parseEnv({
      ...validSource,
      OPENROUTER_MODEL: 'google/gemini-2.5-flash'
    })
    expect(env.openrouterModel).toBe('google/gemini-2.5-flash')
  })
})
