import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { isAllowedGraphQLEndpoint } from './graphqlEndpoint'

describe('isAllowedGraphQLEndpoint', () => {
  it('accepts https endpoints', () => {
    assert.equal(
      isAllowedGraphQLEndpoint('https://api-gateway.example.com/graphql'),
      true
    )
  })

  it('accepts http only for loopback hosts', () => {
    assert.equal(
      isAllowedGraphQLEndpoint('http://localhost:4000/graphql'),
      true
    )
    assert.equal(
      isAllowedGraphQLEndpoint('http://127.0.0.1:4000/graphql'),
      true
    )
    assert.equal(isAllowedGraphQLEndpoint('http://[::1]:4000/graphql'), true)
  })

  it('rejects http for non-loopback hosts', () => {
    assert.equal(
      isAllowedGraphQLEndpoint('http://api-gateway.example.com/graphql'),
      false
    )
    assert.equal(
      isAllowedGraphQLEndpoint('http://10.0.0.5:4000/graphql'),
      false
    )
  })

  it('rejects other protocols and invalid URLs', () => {
    assert.equal(isAllowedGraphQLEndpoint('ftp://example.com/graphql'), false)
    assert.equal(isAllowedGraphQLEndpoint('not-a-url'), false)
  })
})
