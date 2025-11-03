import { createApolloClient } from './apolloClient'

describe('Apollo SSE Client', () => {
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
