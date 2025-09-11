import { TFunction } from 'i18next'

import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'
import { MessagePlatform } from '../../../../../__generated__/globalTypes'

import { getCustomizeFlowConfig } from './getCustomizeFlowConfig'

const t = ((key: string) => key) as unknown as TFunction

describe('getCustomizeFlowConfig', () => {

  it('should return language, social, and done screens when journey has no customization capabilities', () => {
    const journey = {
      journeyCustomizationDescription: null,
      journeyCustomizationFields: [],
      chatButtons: [],
      blocks: []
    } as unknown as Journey

    const result = getCustomizeFlowConfig(journey, t)

    expect(result.screens).toEqual(['language', 'social', 'done'])
    expect(result.totalSteps).toBe(3)
    expect(result.hasEditableText).toBe(false)
    expect(result.hasCustomizableLinks).toBe(false)
    expect(result.links).toEqual([])
  })

  it('should include text screen when journey has editable text', () => {
    const journey = {
      journeyCustomizationDescription: 'Hello {{ firstName: John }}!',
      journeyCustomizationFields: [
        {
          id: '1',
          key: 'firstName',
          value: 'John',
          __typename: 'JourneyCustomizationField'
        }
      ],
      chatButtons: [],
      blocks: []
    } as unknown as Journey

    const result = getCustomizeFlowConfig(journey, t)

    expect(result.screens).toEqual(['language', 'text', 'social', 'done'])
    expect(result.totalSteps).toBe(4)
    expect(result.hasEditableText).toBe(true)
    expect(result.hasCustomizableLinks).toBe(false)
    expect(result.links).toEqual([])
  })

  it('should include links screen when journey has customizable links', () => {
    const journey = {
      journeyCustomizationDescription: null,
      journeyCustomizationFields: [],
      chatButtons: [
        {
          id: 'chat-1',
          platform: MessagePlatform.whatsApp,
          link: 'https://wa.me/123'
        }
      ],
      blocks: []
    } as unknown as Journey

    const result = getCustomizeFlowConfig(journey, t)

    expect(result.screens).toEqual(['language', 'links', 'social', 'done'])
    expect(result.totalSteps).toBe(4)
    expect(result.hasEditableText).toBe(false)
    expect(result.hasCustomizableLinks).toBe(true)
    expect(result.links).toHaveLength(1)
    expect(result.links[0]).toEqual({
      id: 'chat-1',
      linkType: 'chatButtons',
      url: 'https://wa.me/123',
      label: 'Chat: whatsApp'
    })
  })

  it('should include both text and links screens when journey has both capabilities', () => {
    const journey = {
      journeyCustomizationDescription: 'Hello {{ firstName: John }}!',
      journeyCustomizationFields: [
        {
          id: '1',
          key: 'firstName',
          value: 'John',
          __typename: 'JourneyCustomizationField'
        }
      ],
      chatButtons: [
        {
          id: 'chat-1',
          platform: MessagePlatform.whatsApp,
          link: 'https://wa.me/123'
        }
      ],
      blocks: []
    } as unknown as Journey

    const result = getCustomizeFlowConfig(journey, t)

    expect(result.screens).toEqual([
      'language',
      'text',
      'links',
      'social',
      'done'
    ])
    expect(result.totalSteps).toBe(5)
    expect(result.hasEditableText).toBe(true)
    expect(result.hasCustomizableLinks).toBe(true)
    expect(result.links).toHaveLength(1)
  })

  it('should not include text screen when journeyCustomizationDescription is empty', () => {
    const journey = {
      journeyCustomizationDescription: '',
      journeyCustomizationFields: [
        {
          id: '1',
          key: 'firstName',
          value: 'John',
          __typename: 'JourneyCustomizationField'
        }
      ],
      chatButtons: [],
      blocks: []
    } as unknown as Journey

    const result = getCustomizeFlowConfig(journey, t)

    expect(result.screens).toEqual(['language', 'social', 'done'])
    expect(result.totalSteps).toBe(3)
    expect(result.hasEditableText).toBe(false)
    expect(result.hasCustomizableLinks).toBe(false)
    expect(result.links).toEqual([])
  })

  it('should not include text screen when journeyCustomizationFields is empty', () => {
    const journey = {
      journeyCustomizationDescription: 'Hello {{ firstName: John }}!',
      journeyCustomizationFields: [],
      chatButtons: [],
      blocks: []
    } as unknown as Journey

    const result = getCustomizeFlowConfig(journey, t)

    expect(result.screens).toEqual(['language', 'social', 'done'])
    expect(result.totalSteps).toBe(3)
    expect(result.hasEditableText).toBe(false)
    expect(result.hasCustomizableLinks).toBe(false)
    expect(result.links).toEqual([])
  })

  it('should not include text screen when journeyCustomizationDescription is only whitespace', () => {
    const journey = {
      journeyCustomizationDescription: '   ',
      journeyCustomizationFields: [
        {
          id: '1',
          key: 'firstName',
          value: 'John',
          __typename: 'JourneyCustomizationField'
        }
      ],
      chatButtons: [],
      blocks: []
    } as unknown as Journey

    const result = getCustomizeFlowConfig(journey, t)

    expect(result.screens).toEqual(['language', 'social', 'done'])
    expect(result.totalSteps).toBe(3)
    expect(result.hasEditableText).toBe(false)
    expect(result.hasCustomizableLinks).toBe(false)
    expect(result.links).toEqual([])
  })

  it('should always include social screen before done screen', () => {
    const journey = {
      journeyCustomizationDescription: null,
      journeyCustomizationFields: [],
      chatButtons: [],
      blocks: []
    } as unknown as Journey

    const result = getCustomizeFlowConfig(journey, t)

    expect(result.screens).toEqual(['language', 'social', 'done'])
    expect(result.screens[result.screens.length - 2]).toBe('social')
    expect(result.screens[result.screens.length - 1]).toBe('done')
  })

  it('should work without translation function', () => {
    const journey = {
      journeyCustomizationDescription: 'Hello {{ firstName: John }}!',
      journeyCustomizationFields: [
        {
          id: '1',
          key: 'firstName',
          value: 'John',
          __typename: 'JourneyCustomizationField'
        }
      ],
      chatButtons: [],
      blocks: []
    } as unknown as Journey

    const result = getCustomizeFlowConfig(journey)

    expect(result.screens).toEqual(['language', 'text', 'social', 'done'])
    expect(result.totalSteps).toBe(4)
    expect(result.hasEditableText).toBe(true)
    expect(result.hasCustomizableLinks).toBe(false)
    expect(result.links).toEqual([])
  })
})
