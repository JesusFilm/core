import { readConfig } from './config'

const valid = {
  MCP_AUTH_MODE: 'disabled',
  MCP_PUBLIC_URL: 'http://localhost:4010/mcp'
}

describe('MCP configuration', () => {
  it.each([
    {},
    { ...valid, MCP_AUTH_MODE: 'enabled' },
    { ...valid, MCP_PUBLIC_URL: 'http://example.com/mcp' },
    { ...valid, MCP_PUBLIC_URL: 'https://user:secret@example.com/mcp' },
    { ...valid, MCP_PUBLIC_URL: 'https://example.com/ready' },
    { ...valid, MCP_REQUEST_DEADLINE_MS: '20001' },
    { ...valid, MCP_PORT: '12abc' },
    { ...valid, MCP_MAX_RESPONSE_BYTES: '0' },
    { ...valid, MCP_ISSUER_URL: 'not a url' },
    { ...valid, MCP_ADMISSION_ENABLED: 'yes' },
    { ...valid, MCP_ADMISSION_ENABLED: '' },
    { ...valid, MCP_HOST: '' }
  ])('fails closed on invalid configuration %#', (env) => {
    expect(() => readConfig(env)).toThrow()
  })

  it('accepts deployment-specific origins and paths without enabling identity', () => {
    const result = readConfig({
      ...valid,
      MCP_PUBLIC_URL: 'https://mcp.example.com/agents/mcp',
      MCP_ISSUER_URL: 'https://auth.example.com',
      MCP_GATEWAY_URL: 'https://gateway.example.com/graphql'
    })
    expect(result.publicUrl.pathname).toBe('/agents/mcp')
    expect(result.requestDeadlineMs).toBe(20000)
    expect(result.gatewayUrl?.hostname).toBe('gateway.example.com')
  })
})
