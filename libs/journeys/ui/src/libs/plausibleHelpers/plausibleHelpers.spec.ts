import { generateActionTargetKey, keyify, reverseKeyify } from '.'

describe('PlausibleHelpers', () => {
  describe('generateActionTargetKey', () => {
    it('should generate target key for NavigateToBlockAction', () => {
      const action = {
        __typename: 'NavigateToBlockAction',
        blockId: 'blockId'
      }
      expect(generateActionTargetKey(action)).toBe('blockId')
    })

    it('should generate target key for LinkAction', () => {
      const action = {
        __typename: 'LinkAction',
        url: 'url'
      }
      expect(generateActionTargetKey(action)).toBe('link:url')
    })

    it('should generate target key for EmailAction', () => {
      const action = {
        __typename: 'EmailAction',
        email: 'email'
      }
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
        }
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
