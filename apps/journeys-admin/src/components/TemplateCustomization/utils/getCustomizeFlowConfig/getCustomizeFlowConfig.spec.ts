import { TFunction } from 'i18next'

import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'

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
      blocks: [
        {
          __typename: 'ButtonBlock',
          id: '1',
          label: 'Test Button',
          action: {
            __typename: 'LinkAction',
            url: 'https://example.com',
            customizable: true,
            parentStepId: null
          }
        }
      ]
    } as unknown as Journey

    const result = getCustomizeFlowConfig(journey, t)

    expect(result.screens).toEqual(['language', 'links', 'social', 'done'])
    expect(result.totalSteps).toBe(4)
    expect(result.hasEditableText).toBe(false)
    expect(result.hasCustomizableLinks).toBe(true)
    expect(result.links).toHaveLength(1)
    expect(result.links[0]).toEqual({
      customizable: true,
      id: '1',
      label: 'Test Button',
      linkType: 'url',
      parentStepId: null,
      url: 'https://example.com'
    })
  })

  it('should include text, links, and media screens when journey has all three capabilities', () => {
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
      blocks: [
        {
          __typename: 'ButtonBlock',
          id: '1',
          label: 'Test Button',
          action: {
            __typename: 'EmailAction',
            email: 'test@example.com',
            customizable: true,
            parentStepId: null
          }
        },
        {
          __typename: 'ImageBlock',
          id: '1',
          customizable: true
        }
      ]
    } as unknown as Journey

    const result = getCustomizeFlowConfig(journey, t, {
      customizableMedia: true
    })

    expect(result.screens).toEqual([
      'language',
      'text',
      'links',
      'media',
      'social',
      'done'
    ])
    expect(result.totalSteps).toBe(6)
    expect(result.hasEditableText).toBe(true)
    expect(result.hasCustomizableLinks).toBe(true)
    expect(result.links).toHaveLength(1)
  })

  it('should exclude media screen when customizableMedia flag is false', () => {
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
      blocks: [
        {
          __typename: 'ButtonBlock',
          id: '1',
          label: 'Test Button',
          action: {
            __typename: 'EmailAction',
            email: 'test@example.com',
            customizable: true,
            parentStepId: null
          }
        },
        {
          __typename: 'ImageBlock',
          id: '1',
          customizable: true
        }
      ]
    } as unknown as Journey

    const result = getCustomizeFlowConfig(journey, t, {
      customizableMedia: false
    })

    expect(result.screens).toEqual([
      'language',
      'text',
      'links',
      'media',
      'social',
      'done'
    ])
    expect(result.totalSteps).toBe(5)
    expect(result.hasCustomizableMedia).toBe(true)
  })

  it('should include media screen when customizableMedia flag is true', () => {
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
      blocks: [
        {
          __typename: 'ButtonBlock',
          id: '1',
          label: 'Test Button',
          action: {
            __typename: 'EmailAction',
            email: 'test@example.com',
            customizable: true,
            parentStepId: null
          }
        },
        {
          __typename: 'ImageBlock',
          id: '1',
          customizable: true
        }
      ]
    } as unknown as Journey

    const result = getCustomizeFlowConfig(journey, t, {
      customizableMedia: true
    })

    expect(result.screens).toContain('media')
  })

  it('should exclude media screen when options are omitted (outage-safe default)', () => {
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
      blocks: [
        {
          __typename: 'ImageBlock',
          id: '1',
          customizable: true
        }
      ]
    } as unknown as Journey

    const result = getCustomizeFlowConfig(journey, t)

    expect(result.screens).not.toContain('media')
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
