import assert from 'node:assert/strict'
import { afterEach, before, describe, it, mock } from 'node:test'

mock.module('../env', {
  namedExports: {
    env: { GRAPHQL_ENDPOINT: 'https://api.example.com/graphql' }
  }
})

mock.module('../services/firebase', {
  namedExports: {
    getFirebaseClient: () => ({})
  }
})

function getModuleExports<T>(module: T): any {
  return (module as any)['module.exports'] ?? (module as any).default ?? module
}

type ClientModule = typeof import('./graphqlClient')
let createGraphQLClient: ClientModule['createGraphQLClient']
let GraphQLClientError: ClientModule['GraphQLClientError']

before(async () => {
  const clientModule = await import('./graphqlClient')
  const exports = getModuleExports(clientModule)
  createGraphQLClient = exports.createGraphQLClient
  GraphQLClientError = exports.GraphQLClientError
})

const ENDPOINT = 'https://api.example.com/graphql'

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init
  })
}

describe('createGraphQLClient', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('posts the query with auth headers and returns data', async () => {
    const fetchMock = mock.fn(async () => jsonResponse({ data: { ok: true } }))
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const client = createGraphQLClient(ENDPOINT, { Authorization: 'JWT abc' })
    const result = await client.request('query { ok }', { id: '1' })

    assert.deepEqual(result, { ok: true })
    assert.equal(fetchMock.mock.calls.length, 1)
    const [url, init] = fetchMock.mock.calls[0].arguments as unknown as [
      string,
      RequestInit
    ]
    assert.equal(url, ENDPOINT)
    assert.equal(init.method, 'POST')
    assert.deepEqual(init.headers, {
      'Content-Type': 'application/json',
      Authorization: 'JWT abc'
    })
    assert.deepEqual(JSON.parse(init.body as string), {
      query: 'query { ok }',
      variables: { id: '1' }
    })
    assert.ok(init.signal instanceof AbortSignal)
  })

  it('surfaces GraphQL errors from a 2xx response', async () => {
    globalThis.fetch = (async () =>
      jsonResponse({
        data: null,
        errors: [{ message: 'Not authorized' }]
      })) as typeof fetch

    const client = createGraphQLClient(ENDPOINT, {})

    await assert.rejects(client.request('query { ok }'), (error: unknown) => {
      assert.ok(error instanceof GraphQLClientError)
      assert.equal(error.message, 'Not authorized')
      assert.equal(error.response.status, 200)
      assert.deepEqual(error.response.errors, [{ message: 'Not authorized' }])
      return true
    })
  })

  it('preserves GraphQL errors from a non-2xx response', async () => {
    globalThis.fetch = (async () =>
      jsonResponse(
        { errors: [{ message: 'Bad request' }] },
        { status: 400, statusText: 'Bad Request' }
      )) as typeof fetch

    const client = createGraphQLClient(ENDPOINT, {})

    await assert.rejects(client.request('query { ok }'), (error: unknown) => {
      assert.ok(error instanceof GraphQLClientError)
      assert.equal(error.message, 'GraphQL request failed: 400 Bad Request')
      assert.equal(error.response.status, 400)
      assert.deepEqual(error.response.errors, [{ message: 'Bad request' }])
      return true
    })
  })

  it('handles a non-JSON non-2xx response', async () => {
    globalThis.fetch = (async () =>
      new Response('<html>Bad Gateway</html>', {
        status: 502,
        statusText: 'Bad Gateway'
      })) as typeof fetch

    const client = createGraphQLClient(ENDPOINT, {})

    await assert.rejects(client.request('query { ok }'), (error: unknown) => {
      assert.ok(error instanceof GraphQLClientError)
      assert.equal(error.message, 'GraphQL request failed: 502 Bad Gateway')
      assert.equal(error.response.status, 502)
      assert.equal(error.response.errors, undefined)
      return true
    })
  })

  it('rejects a 2xx response whose body is not JSON', async () => {
    globalThis.fetch = (async () =>
      new Response('<html>OK</html>', {
        status: 200,
        statusText: 'OK'
      })) as typeof fetch

    const client = createGraphQLClient(ENDPOINT, {})

    await assert.rejects(client.request('query { ok }'), (error: unknown) => {
      assert.ok(error instanceof GraphQLClientError)
      assert.match(error.message, /not valid JSON/)
      assert.equal(error.response.status, 200)
      return true
    })
  })

  it('aborts a request that exceeds the timeout', async () => {
    globalThis.fetch = ((_url: string, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () =>
          reject(init.signal?.reason)
        )
      })) as unknown as typeof fetch

    const client = createGraphQLClient(ENDPOINT, {}, { timeoutMs: 20 })

    await assert.rejects(client.request('query { ok }'), (error: unknown) => {
      assert.ok(error instanceof Error)
      assert.match(error.message, /timed out after 20ms/)
      assert.equal((error.cause as Error).name, 'TimeoutError')
      return true
    })
  })
})
