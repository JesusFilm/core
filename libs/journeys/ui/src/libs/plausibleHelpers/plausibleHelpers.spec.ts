import { ActionFields as Action } from '../action/__generated__/ActionFields'
import { BlockFields_ButtonBlock_action as ButtonBlockAction } from '../block/__generated__/BlockFields'

import { getTargetEventKey } from './plausibleHelpers'

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

    it('should return empty string for null or undefined actions', () => {
      const nullAction = null
      const undefinedAction = undefined

      expect(getTargetEventKey(nullAction)).toBe('')
      expect(getTargetEventKey(undefinedAction)).toBe('')
    })
  })
})
