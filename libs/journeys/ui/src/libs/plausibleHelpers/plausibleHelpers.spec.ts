import { ActionFields as Action } from '../action/__generated__/ActionFields'
import { BlockFields_ButtonBlock_action as ButtonBlockAction } from '../block/__generated__/BlockFields'

import {
  actionToTarget,
  getTargetEventKey,
  templateKeyify
} from './plausibleHelpers'

import { generateActionTargetKey, keyify, reverseKeyify } from '.'

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

    it('should generate target key for ChatAction', () => {
      const action = {
        __typename: 'ChatAction',
        chatUrl: 'https://chat.example.com'
      } as unknown as Action
      expect(generateActionTargetKey(action)).toBe(
        'chat:https://chat.example.com'
      )
    })

    it('should generate target key for PhoneAction', () => {
      const action = {
        __typename: 'PhoneAction',
        phone: 'phone'
      } as unknown as Action
      expect(generateActionTargetKey(action)).toBe('phone:phone')
    })

    it('should throw error for unknown action type', () => {
      const action = {
        __typename: 'UnknownAction',
        unknown: 'unknown'
      } as unknown as Action
      expect(() => generateActionTargetKey(action)).toThrow(
        'Unknown action type'
      )
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

  describe('getTargetEventKey', () => {
    it('should return target for link action', () => {
      const action = {
        __typename: 'LinkAction',
        parentBlockId: 'block1.id',
        url: 'https://youtube.com'
      } as unknown as ButtonBlockAction

      expect(getTargetEventKey(action)).toBe(
        'block1.id->link:https://youtube.com'
      )
    })

    it('should return target for chat action', () => {
      const action = {
        __typename: 'ChatAction',
        parentBlockId: 'block1.id',
        chatUrl: 'https://chat.example.com'
      } as unknown as ButtonBlockAction

      expect(getTargetEventKey(action)).toBe(
        'block1.id->chat:https://chat.example.com'
      )
    })

    it('should return empty string for null or undefined actions', () => {
      const nullAction = null
      const undefinedAction = undefined

      expect(getTargetEventKey(nullAction)).toBe('')
      expect(getTargetEventKey(undefinedAction)).toBe('')
    })
  })

  describe('templateKeyify', () => {
    it('should generate key with event and journeyId only', () => {
      const props = {
        event: 'buttonClick' as const,
        journeyId: 'journeyId'
      }
      expect(templateKeyify(props)).toBe(
        JSON.stringify({
          event: 'buttonClick',
          target: '',
          journeyId: 'journeyId'
        })
      )
    })

    it('should generate key with string target', () => {
      const props = {
        event: 'buttonClick' as const,
        target: 'target',
        journeyId: 'journeyId'
      }
      expect(templateKeyify(props)).toBe(
        JSON.stringify({
          event: 'buttonClick',
          target: 'target',
          journeyId: 'journeyId'
        })
      )
    })

    it('should generate key with null target', () => {
      const props = {
        event: 'buttonClick' as const,
        target: null,
        journeyId: 'journeyId'
      }
      expect(templateKeyify(props)).toBe(
        JSON.stringify({
          event: 'buttonClick',
          target: '',
          journeyId: 'journeyId'
        })
      )
    })

    it('should generate key with action target', () => {
      const props = {
        event: 'buttonClick' as const,
        target: {
          __typename: 'LinkAction',
          url: 'https://example.com'
        } as unknown as Action,
        journeyId: 'journeyId'
      }
      expect(templateKeyify(props)).toBe(
        JSON.stringify({
          event: 'buttonClick',
          target: 'link:https://example.com',
          journeyId: 'journeyId'
        })
      )
    })

    it('should generate key without journeyId', () => {
      const props = {
        event: 'buttonClick' as const,
        target: 'target'
      }
      expect(templateKeyify(props)).toBe(
        JSON.stringify({
          event: 'buttonClick',
          target: 'target',
          journeyId: undefined
        })
      )
    })
  })

  describe('actionToTarget', () => {
    it('should return null for null action', () => {
      expect(actionToTarget(null)).toBe(null)
    })

    it('should return null for NavigateToBlockAction', () => {
      const action = {
        __typename: 'NavigateToBlockAction',
        blockId: 'blockId'
      } as unknown as ButtonBlockAction
      expect(actionToTarget(action)).toBe(null)
    })

    it('should return null for EmailAction', () => {
      const action = {
        __typename: 'EmailAction',
        email: 'test@example.com'
      } as unknown as ButtonBlockAction
      expect(actionToTarget(action)).toBe(null)
    })

    it('should return "chat" for ChatAction', () => {
      const action = {
        __typename: 'ChatAction',
        chatUrl: 'https://chat.example.com'
      } as unknown as ButtonBlockAction
      expect(actionToTarget(action)).toBe('chat')
    })

    it('should return "chat" for PhoneAction', () => {
      const action = {
        __typename: 'PhoneAction',
        phone: '+1234567890'
      } as unknown as ButtonBlockAction
      expect(actionToTarget(action)).toBe('chat')
    })

    it('should return "link" for LinkAction with non-message platform URL', () => {
      const action = {
        __typename: 'LinkAction',
        url: 'https://youtube.com'
      } as unknown as ButtonBlockAction
      expect(actionToTarget(action)).toBe('link')
    })

    it('should return "chat" for LinkAction with message platform URL (m.me)', () => {
      const action = {
        __typename: 'LinkAction',
        url: 'https://m.me/some-user'
      } as unknown as ButtonBlockAction
      expect(actionToTarget(action)).toBe('chat')
    })

    it('should return "chat" for LinkAction with message platform URL (wa.me)', () => {
      const action = {
        __typename: 'LinkAction',
        url: 'https://wa.me/1234567890'
      } as unknown as ButtonBlockAction
      expect(actionToTarget(action)).toBe('chat')
    })

    it('should return "chat" for LinkAction with message platform URL (t.me)', () => {
      const action = {
        __typename: 'LinkAction',
        url: 'https://t.me/some-user'
      } as unknown as ButtonBlockAction
      expect(actionToTarget(action)).toBe('chat')
    })

    it('should return "chat" for LinkAction with message platform URL (instagram.com)', () => {
      const action = {
        __typename: 'LinkAction',
        url: 'https://instagram.com/some-user'
      } as unknown as ButtonBlockAction
      expect(actionToTarget(action)).toBe('chat')
    })
  })
})
