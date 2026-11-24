import { GatewayError, graphqlRequest } from './graphqlRequest'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' }
  })
}

describe('graphqlRequest', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('posts to the validated gateway url as this service, with a timeout', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse({ data: { language: { id: '529' } } }))

    await expect(
      graphqlRequest('query { language }', { id: '529' })
    ).resolves.toEqual({ language: { id: '529' } })

    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://localhost/graphql')
    expect(init).toMatchObject({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'interop-token': 'test-interop-token',
        'x-graphql-client-name': 'api-journeys-modern',
        'x-graphql-client-version': 'test-version'
      },
      body: JSON.stringify({
        query: 'query { language }',
        variables: { id: '529' }
      })
    })
    expect(init?.signal).toBeInstanceOf(AbortSignal)
  })

  it('is gateway unavailable when the request times out', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new DOMException('The operation timed out.', 'TimeoutError')
    )

    const error = await graphqlRequest('query { language }', {}).catch(
      (caught: unknown) => caught
    )

    expect(error).toBeInstanceOf(GatewayError)
    expect(error).toMatchObject({
      message: 'gateway unavailable',
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })
  })

  it('is gateway unavailable for an HTML 502 instead of failing to parse it', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('<html>Bad Gateway</html>', {
        status: 502,
        headers: { 'content-type': 'text/html' }
      })
    )

    await expect(
      graphqlRequest('query { language }', {})
    ).rejects.toMatchObject({
      message: 'gateway unavailable',
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })
  })

  it('is gateway unavailable for a 200 that is not JSON', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('<html>maintenance</html>', {
        status: 200,
        headers: { 'content-type': 'text/html' }
      })
    )

    await expect(
      graphqlRequest('query { language }', {})
    ).rejects.toBeInstanceOf(GatewayError)
  })

  it('carries a GraphQL error response on the gateway error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({
        data: null,
        errors: [{ message: 'subgraph exploded', path: ['language'] }]
      })
    )

    const error = await graphqlRequest('query { language }', {}).catch(
      (caught: unknown) => caught
    )

    expect(error).toBeInstanceOf(GatewayError)
    expect(error).toMatchObject({
      message: 'subgraph exploded',
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
      data: null,
      gatewayErrors: [{ message: 'subgraph exploded', path: ['language'] }]
    })
  })
})
