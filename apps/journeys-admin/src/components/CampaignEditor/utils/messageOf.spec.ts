import { CombinedGraphQLErrors } from '@apollo/client'

import { messageOf } from './messageOf'

const graphQLError = new CombinedGraphQLErrors({
  errors: [{ message: 'Journey not found or not published' }]
})

describe('messageOf', () => {
  describe('without a fallback', () => {
    it('returns the GraphQL error’s message', () => {
      expect(messageOf(graphQLError)).toBe('Journey not found or not published')
    })

    it('returns an Error’s message', () => {
      expect(messageOf(new Error('Network request failed'))).toBe(
        'Network request failed'
      )
    })

    it('stringifies anything else', () => {
      expect(messageOf('refused')).toBe('refused')
      expect(messageOf(undefined)).toBe('undefined')
    })
  })

  describe('with a fallback', () => {
    it('still returns the GraphQL error’s message', () => {
      expect(messageOf(graphQLError, 'Could not link journey')).toBe(
        'Journey not found or not published'
      )
    })

    it('still returns an Error’s message', () => {
      expect(
        messageOf(new Error('Network request failed'), 'Could not link journey')
      ).toBe('Network request failed')
    })

    it('returns the fallback for anything else', () => {
      expect(messageOf('refused', 'Could not link journey')).toBe(
        'Could not link journey'
      )
      expect(messageOf(undefined, 'Could not link journey')).toBe(
        'Could not link journey'
      )
    })
  })
})
