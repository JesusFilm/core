import { retireMcpAccount } from './retireMcpAccount'

describe('account authority retirement', () => {
  beforeEach(() => {
    vi.stubEnv('MCP_READS_ENABLED', 'true')
    vi.stubEnv('MCP_ACCOUNT_AUTHORITY_URL', 'http://127.0.0.1:4011')
    vi.stubEnv(
      'MCP_ACCOUNT_AUTHORITY_SECRET',
      'users-permission-secret-at-least-32-characters'
    )
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('requires positive drain completion before deletion may continue', async () => {
    const send = vi.fn().mockResolvedValue(Response.json({ status: 'pending' }))
    vi.stubGlobal('fetch', send)
    await expect(retireMcpAccount('deleted-user')).rejects.toThrow(
      'MCP authority retirement pending'
    )
    expect(send).toHaveBeenCalledWith(
      'http://127.0.0.1:4011/internal/permissions/retire-account',
      expect.objectContaining({
        body: JSON.stringify({ userId: 'deleted-user' }),
        redirect: 'error'
      })
    )
    send.mockResolvedValue(Response.json({ status: 'complete' }))
    await expect(retireMcpAccount('deleted-user')).resolves.toBeUndefined()
  })

  it.each([
    new Response(null, { status: 503 }),
    Response.json({ status: 'unknown' }),
    Response.json({ status: 'complete', userId: 'other-user' }),
    Response.json({ status: 'complete' }, { status: 403 })
  ])('fails closed on unavailable or malformed authority', async (response) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
    await expect(retireMcpAccount('deleted-user')).rejects.toThrow()
  })

  it('does not allow an enabled deployment to omit its retirement participant', async () => {
    vi.stubEnv('MCP_ACCOUNT_AUTHORITY_SECRET', '')
    await expect(retireMcpAccount('deleted-user')).rejects.toThrow()
  })

  it('rejects invalid enable flags instead of silently bypassing retirement', async () => {
    vi.stubEnv('MCP_READS_ENABLED', 'TRUE')
    vi.stubEnv('MCP_ACCOUNT_AUTHORITY_URL', '')
    vi.stubEnv('MCP_ACCOUNT_AUTHORITY_SECRET', '')
    await expect(retireMcpAccount('deleted-user')).rejects.toThrow()
  })

  it('preserves deletion when MCP is disabled and unconfigured', async () => {
    vi.stubEnv('MCP_READS_ENABLED', 'false')
    vi.stubEnv('MCP_ACCOUNT_AUTHORITY_URL', '')
    vi.stubEnv('MCP_ACCOUNT_AUTHORITY_SECRET', '')
    const send = vi.fn()
    vi.stubGlobal('fetch', send)
    await expect(retireMcpAccount('deleted-user')).resolves.toBeUndefined()
    expect(send).not.toHaveBeenCalled()
  })
})
