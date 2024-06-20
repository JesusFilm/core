import { generateActionTargetKey, keyify, reverseKeyify } from '.'
import { ActionFields as Action } from '../action/__generated__/ActionFields'

describe('PlausibleHelpers', () => {
  describe('generateActionTargetKey', () => {
    it('should generate target key for NavigateToBlockAction', () => {
      const action = {
        __typename: 'NavigateToBlockAction',
        blockId: 'blockId'
      } as unknown as Action
      expect(generateActionTargetKey(action)).toBe('blockId')
    })

    it('should generate target key for LinkAction', () => {
      const action = {
        __typename: 'LinkAction',
        url: 'url'
      } as unknown as Action
      expect(generateActionTargetKey(action)).toBe('link:url')
    })

    it('should generate target key for EmailAction', () => {
      const action = {
        __typename: 'EmailAction',
        email: 'email'
      } as unknown as Action
      expect(generateActionTargetKey(action)).toBe('email:email')
    })
  })

  describe('keyify', () => {
    it('should generate key for string target', () => {
      const props = {
        stepId: 'stepId',
        event: 'event',
        blockId: 'blockId',
        target: 'target'
      }
      expect(keyify(props)).toBe(
        JSON.stringify({
          stepId: 'stepId',
          event: 'event',
          blockId: 'blockId',
          target: 'target'
        })
      )
    })

    it('should generate key for action target', () => {
      const props = {
        stepId: 'stepId',
        event: 'event',
        blockId: 'blockId',
        target: {
          __typename: 'NavigateToBlockAction',
          blockId: 'blockId'
        } as unknown as Action
      }
      expect(keyify(props)).toBe(
        JSON.stringify({
          stepId: 'stepId',
          event: 'event',
          blockId: 'blockId',
          target: 'blockId'
        })
      )
    })
  })

  describe('reverseKeyify', () => {
    it('should reverse keyify', () => {
      const key = JSON.stringify({
        stepId: 'stepId',
        event: 'event',
        blockId: 'blockId',
        target: 'target'
      })
      expect(reverseKeyify(key)).toEqual({
        stepId: 'stepId',
        event: 'event',
        blockId: 'blockId',
        target: 'target'
      })
    })
  })
})
