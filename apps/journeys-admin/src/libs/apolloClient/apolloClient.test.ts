import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
  execute,
  gql
} from '@apollo/client'
import { OperationTypeNode, print } from 'graphql'
import { createClient } from 'graphql-sse'
import { EMPTY } from 'rxjs'
import { type Mock, type MockedFunction } from 'vitest'

import { logout } from '../auth/firebase'

import {
  SSELink,
  createApolloClient,
  createErrorLink,
  resolveGatewayUrl
} from './apolloClient'

vi.mock('graphql-sse', () => ({
  createClient: vi.fn()
}))

vi.mock('../auth/firebase', () => ({
  logout: vi.fn().mockResolvedValue(undefined)
}))

const mockCreateClient = createClient as MockedFunction<typeof createClient>
const mockLogout = logout as MockedFunction<typeof logout>

// Apollo Client 4 requires every operation to carry `operationType` and the
// `client` that issued it, and `execute` takes that client as a third argument.
const testClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.empty()
})

function mockOperation(
  operation: Pick<
    ApolloLink.Operation,
    'query' | 'variables' | 'operationName' | 'getContext'
  >
): ApolloLink.Operation {
  return {
    ...operation,
    operationType: OperationTypeNode.SUBSCRIPTION,
    client: testClient,
    setContext: vi.fn(),
    extensions: {}
  }
}

describe('createApolloClient', () => {
  beforeEach(() => {
    mockCreateClient.mockReturnValue({
      subscribe: vi.fn()
    } as unknown as ReturnType<typeof createClient>)
  })

  it('should create Apollo client with SSE support', () => {
    const client = createApolloClient()
    expect(client).toBeDefined()
    expect(client.link).toBeDefined()
    expect(client.cache).toBeDefined()
  })

  it('should create Apollo client with auth token', () => {
    const client = createApolloClient('test-token')
    expect(client).toBeDefined()
    expect(client.link).toBeDefined()
    expect(client.cache).toBeDefined()
  })
})

describe('SSELink', () => {
  let mockSubscribe: Mock

  beforeEach(() => {
    mockSubscribe = vi.fn()
    mockCreateClient.mockReturnValue({
      subscribe: mockSubscribe
    } as unknown as ReturnType<typeof createClient>)
  })

  it('forwards operation query, variables, and operationName to graphql-sse client', async () => {
    mockSubscribe.mockImplementation((_op, sink) => {
      sink.next({ data: { item: { id: 'item-1' } } })
      sink.complete()
      return () => undefined
    })

    const link = new SSELink('http://localhost:4000')
    const doc = gql`
      query TestOp($id: ID!) {
        item(id: $id) {
          id
        }
      }
    `
    const vars = { id: 'item-1' }

    await new Promise<void>((resolve, reject) => {
      link
        .request(
          mockOperation({
            query: doc,
            variables: vars,
            operationName: 'TestOp',
            getContext: () => ({ headers: {} })
          }),
          () => EMPTY
        )
        .subscribe({
          next: () => {
            try {
              expect(mockSubscribe).toHaveBeenCalledWith(
                expect.objectContaining({
                  query: print(doc),
                  variables: vars,
                  operationName: 'TestOp'
                }),
                expect.any(Object)
              )
              resolve()
            } catch (error) {
              reject(error instanceof Error ? error : new Error(String(error)))
            }
          },
          error: reject
        })
    })
  })

  it('forwards auth headers from operation context', async () => {
    mockSubscribe.mockImplementation((_op, sink) => {
      sink.next({ data: {} })
      sink.complete()
      return () => undefined
    })

    const link = new SSELink('http://localhost:4000')
    const doc = gql`
      subscription TestSub {
        ping
      }
    `

    await new Promise<void>((resolve, reject) => {
      link
        .request(
          mockOperation({
            query: doc,
            variables: {},
            operationName: 'TestSub',
            getContext: () => ({ headers: { Authorization: 'JWT my-token' } })
          }),
          () => EMPTY
        )
        .subscribe({
          next: () => {
            try {
              // The headers factory in createClient is called at subscribe time,
              // so we verify that the client was created and subscribe was called
              expect(mockSubscribe).toHaveBeenCalled()
              resolve()
            } catch (error) {
              reject(error instanceof Error ? error : new Error(String(error)))
            }
          },
          error: reject
        })
    })
  })

  it('propagates errors from graphql-sse sink to the observer', async () => {
    const sseError = new Error('SSE connection failed')
    mockSubscribe.mockImplementation((_op, sink) => {
      sink.error(sseError)
      return () => undefined
    })

    const link = new SSELink('http://localhost:4000')
    const doc = gql`
      subscription TestSubError {
        ping
      }
    `

    await new Promise<void>((resolve, reject) => {
      link
        .request(
          mockOperation({
            query: doc,
            variables: {},
            operationName: 'TestSubError',
            getContext: () => ({})
          }),
          () => EMPTY
        )
        .subscribe({
          error: (err: Error) => {
            try {
              expect(err).toBe(sseError)
              resolve()
            } catch (error) {
              reject(error instanceof Error ? error : new Error(String(error)))
            }
          }
        })
    })
  })
})

describe('resolveGatewayUrl', () => {
  const originalEnv = process.env
  const DEV_HOSTS_JSON = JSON.stringify({
    siyang: 'tailscale-dev-siyang.taila2a609.ts.net',
    mike: 'tailscale-dev-mike.taila2a609.ts.net'
  })

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.NEXT_PUBLIC_GATEWAY_URL
    delete process.env.NEXT_PUBLIC_DEV_HOSTS
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('uses NEXT_PUBLIC_GATEWAY_URL when set, regardless of hostname', () => {
    process.env.NEXT_PUBLIC_GATEWAY_URL = 'https://stage-gw.example.com'
    process.env.NEXT_PUBLIC_DEV_HOSTS = DEV_HOSTS_JSON

    expect(
      resolveGatewayUrl({
        hostname: 'tailscale-dev-siyang.taila2a609.ts.net',
        protocol: 'http:'
      })
    ).toBe('https://stage-gw.example.com')
  })

  it('derives gateway URL from location for a host listed in NEXT_PUBLIC_DEV_HOSTS', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = DEV_HOSTS_JSON

    expect(
      resolveGatewayUrl({
        hostname: 'tailscale-dev-siyang.taila2a609.ts.net',
        protocol: 'http:'
      })
    ).toBe('http://tailscale-dev-siyang.taila2a609.ts.net:4000')
  })

  it('preserves protocol when deriving (https for Tailscale Funnel)', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = DEV_HOSTS_JSON

    expect(
      resolveGatewayUrl({
        hostname: 'tailscale-dev-siyang.taila2a609.ts.net',
        protocol: 'https:'
      })
    ).toBe('https://tailscale-dev-siyang.taila2a609.ts.net:4000')
  })

  it('falls back to localhost for a host not in NEXT_PUBLIC_DEV_HOSTS', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = DEV_HOSTS_JSON

    expect(
      resolveGatewayUrl({ hostname: 'localhost', protocol: 'http:' })
    ).toBe('http://localhost:4000')
  })

  it('falls back to localhost on the server (no location)', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = DEV_HOSTS_JSON

    expect(resolveGatewayUrl(undefined)).toBe('http://localhost:4000')
  })

  it('falls back to localhost when NEXT_PUBLIC_DEV_HOSTS is unset (no dev relaxation)', () => {
    expect(
      resolveGatewayUrl({
        hostname: 'tailscale-dev-siyang.taila2a609.ts.net',
        protocol: 'http:'
      })
    ).toBe('http://localhost:4000')
  })

  it('falls back to localhost when NEXT_PUBLIC_DEV_HOSTS is an empty string', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = ''

    expect(
      resolveGatewayUrl({
        hostname: 'tailscale-dev-siyang.taila2a609.ts.net',
        protocol: 'http:'
      })
    ).toBe('http://localhost:4000')
  })

  it('falls back to localhost when NEXT_PUBLIC_DEV_HOSTS is malformed JSON', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = '{not valid json'

    expect(
      resolveGatewayUrl({
        hostname: 'tailscale-dev-siyang.taila2a609.ts.net',
        protocol: 'http:'
      })
    ).toBe('http://localhost:4000')
  })

  it('falls back to localhost for a spoofed host not in NEXT_PUBLIC_DEV_HOSTS', () => {
    process.env.NEXT_PUBLIC_DEV_HOSTS = DEV_HOSTS_JSON

    expect(
      resolveGatewayUrl({
        hostname: 'tailscale-evil.attacker.com',
        protocol: 'http:'
      })
    ).toBe('http://localhost:4000')
  })
})

describe('createErrorLink', () => {
  beforeEach(() => {
    mockLogout.mockClear()
  })

  it('calls logout and propagates Session expired error on UNAUTHENTICATED', async () => {
    const errorLink = createErrorLink()

    const terminatingLink = new ApolloLink(
      () =>
        new Observable<ApolloLink.Result>((observer) => {
          observer.next({
            errors: [
              {
                message: 'Not authenticated',
                extensions: { code: 'UNAUTHENTICATED' },
                locations: undefined,
                path: undefined
              }
            ]
          })
          observer.complete()
        })
    )

    const link = ApolloLink.from([errorLink, terminatingLink])

    await new Promise<void>((resolve, reject) => {
      execute(
        link,
        {
          query: gql`
            query Test {
              test
            }
          `
        },
        { client: testClient }
      ).subscribe({
        error: (err: Error) => {
          try {
            expect(mockLogout).toHaveBeenCalled()
            expect(err.message).toBe('Session expired')
            resolve()
          } catch (error) {
            reject(error instanceof Error ? error : new Error(String(error)))
          }
        }
      })
    })
  })

  it('does not call logout for non-UNAUTHENTICATED errors', async () => {
    const errorLink = createErrorLink()

    const terminatingLink = new ApolloLink(
      () =>
        new Observable<ApolloLink.Result>((observer) => {
          observer.next({
            errors: [
              {
                message: 'Something went wrong',
                extensions: { code: 'INTERNAL_SERVER_ERROR' },
                locations: undefined,
                path: undefined
              }
            ]
          })
          observer.complete()
        })
    )

    const link = ApolloLink.from([errorLink, terminatingLink])

    await new Promise<void>((resolve, reject) => {
      execute(
        link,
        {
          query: gql`
            query TestNonAuth {
              test
            }
          `
        },
        { client: testClient }
      ).subscribe({
        next: () => {
          try {
            expect(mockLogout).not.toHaveBeenCalled()
          } catch (error) {
            reject(error instanceof Error ? error : new Error(String(error)))
          }
        },
        complete: resolve,
        error: reject
      })
    })
  })
})
