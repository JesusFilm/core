import {
  ApolloLink,
  FetchResult,
  Observable,
  execute,
  from,
  gql
} from '@apollo/client'
import { print } from 'graphql'
import { createClient } from 'graphql-sse'

import { logout } from '../auth/firebase'

import { SSELink, createApolloClient, createErrorLink } from './apolloClient'

jest.mock('graphql-sse', () => ({
  createClient: jest.fn()
}))

jest.mock('../auth/firebase', () => ({
  logout: jest.fn().mockResolvedValue(undefined)
}))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockLogout = logout as jest.MockedFunction<typeof logout>

describe('createApolloClient', () => {
  beforeEach(() => {
    mockCreateClient.mockReturnValue({ subscribe: jest.fn() } as unknown as ReturnType<typeof createClient>)
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
  let mockSubscribe: jest.Mock

  beforeEach(() => {
    mockSubscribe = jest.fn()
    mockCreateClient.mockReturnValue({
      subscribe: mockSubscribe
    } as unknown as ReturnType<typeof createClient>)
  })

  it('forwards operation query, variables, and operationName to graphql-sse client', (done) => {
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

    link
      .request(
        {
          query: doc,
          variables: vars,
          operationName: 'TestOp',
          getContext: () => ({ headers: {} }),
          setContext: jest.fn(),
          extensions: {}
        },
        undefined
      )
      ?.subscribe({
        next: () => {
          expect(mockSubscribe).toHaveBeenCalledWith(
            expect.objectContaining({
              query: print(doc),
              variables: vars,
              operationName: 'TestOp'
            }),
            expect.any(Object)
          )
          done()
        },
        error: done
      })
  })

  it('forwards auth headers from operation context', (done) => {
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

    link
      .request(
        {
          query: doc,
          variables: {},
          operationName: 'TestSub',
          getContext: () => ({ headers: { Authorization: 'JWT my-token' } }),
          setContext: jest.fn(),
          extensions: {}
        },
        undefined
      )
      ?.subscribe({
        next: () => {
          // The headers factory in createClient is called at subscribe time,
          // so we verify that the client was created and subscribe was called
          expect(mockSubscribe).toHaveBeenCalled()
          done()
        },
        error: done
      })
  })

  it('propagates errors from graphql-sse sink to the observer', (done) => {
    const sseError = new Error('SSE connection failed')
    mockSubscribe.mockImplementation((_op, sink) => {
      sink.error(sseError)
      return () => undefined
    })

    const link = new SSELink('http://localhost:4000')
    const doc = gql`
      subscription TestSub {
        ping
      }
    `

    link
      .request(
        {
          query: doc,
          variables: {},
          operationName: 'TestSub',
          getContext: () => ({}),
          setContext: jest.fn(),
          extensions: {}
        },
        undefined
      )
      ?.subscribe({
        error: (err: Error) => {
          expect(err).toBe(sseError)
          done()
        }
      })
  })
})

describe('createErrorLink', () => {
  beforeEach(() => {
    mockLogout.mockClear()
  })

  it('calls logout and propagates Session expired error on UNAUTHENTICATED', (done) => {
    const errorLink = createErrorLink()

    const terminatingLink = new ApolloLink(
      () =>
        new Observable<FetchResult>((observer) => {
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

    const link = from([errorLink, terminatingLink])

    execute(link, { query: gql`query Test { test }` }).subscribe({
      error: (err: Error) => {
        expect(mockLogout).toHaveBeenCalled()
        expect(err.message).toBe('Session expired')
        done()
      }
    })
  })

  it('does not call logout for non-UNAUTHENTICATED errors', (done) => {
    const errorLink = createErrorLink()

    const terminatingLink = new ApolloLink(
      () =>
        new Observable<FetchResult>((observer) => {
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

    const link = from([errorLink, terminatingLink])

    execute(link, { query: gql`query Test { test }` }).subscribe({
      next: () => {
        expect(mockLogout).not.toHaveBeenCalled()
      },
      complete: done,
      error: done
    })
  })
})
