import { TFunction } from 'next-i18next'

import { actions, getAction } from './actions'

describe('actions', () => {
  describe('actions', () => {
    it('should return an array of actions', () => {
      const t = jest.fn().mockImplementation((key) => `translation_${key}`)
      const result = actions(t as unknown as TFunction)
      expect(result).toEqual([
        {
          value: 'None',
          label: 'translation_None'
        },
        {
          value: 'NavigateToBlockAction',
          label: 'translation_Selected Card'
        },
        {
          value: 'LinkAction',
          label: 'translation_Website'
        },
        {
          value: 'EmailAction',
          label: 'translation_Email'
        },
        {
          value: 'ChatAction',
          label: 'translation_Chat'
        },
        {
          value: 'PhoneAction',
          label: 'translation_Phone'
        }
      ])
    })
  })

  describe('getAction', () => {
    it('should return the action object from the value', () => {
      const t = jest.fn().mockImplementation((key) => `translation_${key}`)
      const value = 'LinkAction'
      const result = getAction(t as unknown as TFunction, value)
      expect(result).toEqual({
        value: 'LinkAction',
        label: 'translation_Website'
      })
    })

    it('should return None if the value is not found', () => {
      const t = jest.fn().mockImplementation((key) => `translation_${key}`)
      const result = getAction(t as unknown as TFunction, undefined)
      expect(result).toEqual({
        value: 'None',
        label: 'translation_None'
      })
    })

    it('should return ChatAction when value is ChatAction', () => {
      const t = jest.fn().mockImplementation((key) => `translation_${key}`)
      const value = 'ChatAction'
      const result = getAction(t as unknown as TFunction, value)
      expect(result).toEqual({
        value: 'ChatAction',
        label: 'translation_Chat'
      })
    })
  })
})
