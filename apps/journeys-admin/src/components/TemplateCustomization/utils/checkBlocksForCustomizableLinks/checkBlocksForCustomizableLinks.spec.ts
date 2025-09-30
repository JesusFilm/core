import {
  GetJourney_journey_blocks as Block,
  GetJourney_journey_blocks_ButtonBlock as ButtonBlock,
  GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock,
  GetJourney_journey_blocks_VideoTriggerBlock as VideoTriggerBlock
} from '../../../../../__generated__/GetJourney'

import { checkBlocksForCustomizableLinks } from './checkBlocksForCustomizableLinks'

describe('checkBlocksForCustomizableLinks', () => {
  it('should return false for empty blocks array', () => {
    const result = checkBlocksForCustomizableLinks([])
    expect(result).toBe(false)
  })

  it('should return false for unsupported block types', () => {
    const unsupportedBlock = {
      __typename: 'TextBlock',
      id: '1',
      parentBlockId: null,
      parentOrder: 0
    } as unknown as Block

    const result = checkBlocksForCustomizableLinks([unsupportedBlock])
    expect(result).toBe(false)
  })

  it('should return true for ButtonBlock with customizable LinkAction', () => {
    const buttonBlock = {
      __typename: 'ButtonBlock',
      id: '1',
      parentBlockId: null,
      parentOrder: 0,
      label: 'Test Button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      submitEnabled: null,
      action: {
        __typename: 'LinkAction',
        parentBlockId: '1',
        gtmEventName: null,
        url: 'https://example.com',
        customizable: true,
        parentStepId: null
      },
      settings: null
    } as ButtonBlock

    const result = checkBlocksForCustomizableLinks([buttonBlock])
    expect(result).toBe(true)
  })

  it('should return true for ButtonBlock with customizable EmailAction', () => {
    const buttonBlock = {
      __typename: 'ButtonBlock',
      id: '1',
      parentBlockId: null,
      parentOrder: 0,
      label: 'Test Button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      submitEnabled: null,
      action: {
        __typename: 'EmailAction',
        parentBlockId: '1',
        gtmEventName: null,
        email: 'test@example.com',
        customizable: true,
        parentStepId: null
      },
      settings: null
    } as ButtonBlock

    const result = checkBlocksForCustomizableLinks([buttonBlock])
    expect(result).toBe(true)
  })

  it('should return false for ButtonBlock with non-customizable action', () => {
    const buttonBlock = {
      __typename: 'ButtonBlock',
      id: '1',
      parentBlockId: null,
      parentOrder: 0,
      label: 'Test Button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      submitEnabled: null,
      action: {
        __typename: 'LinkAction',
        parentBlockId: '1',
        gtmEventName: null,
        url: 'https://example.com',
        customizable: false,
        parentStepId: null
      },
      settings: null
    } as ButtonBlock

    const result = checkBlocksForCustomizableLinks([buttonBlock])
    expect(result).toBe(false)
  })

  it('should return false for ButtonBlock with null action', () => {
    const buttonBlock = {
      __typename: 'ButtonBlock',
      id: '1',
      parentBlockId: null,
      parentOrder: 0,
      label: 'Test Button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      submitEnabled: null,
      action: null,
      settings: null
    } as ButtonBlock

    const result = checkBlocksForCustomizableLinks([buttonBlock])
    expect(result).toBe(false)
  })

  it('should return true for RadioOptionBlock with customizable LinkAction', () => {
    const radioOptionBlock = {
      __typename: 'RadioOptionBlock',
      id: '1',
      parentBlockId: null,
      parentOrder: 0,
      label: 'Test Option',
      action: {
        __typename: 'LinkAction',
        parentBlockId: '1',
        gtmEventName: null,
        url: 'https://example.com',
        customizable: true,
        parentStepId: null
      },
      pollOptionImageBlockId: null
    } as RadioOptionBlock

    const result = checkBlocksForCustomizableLinks([radioOptionBlock])
    expect(result).toBe(true)
  })

  it('should return true for VideoBlock with customizable LinkAction', () => {
    const videoBlock = {
      __typename: 'VideoBlock',
      id: '1',
      parentBlockId: null,
      parentOrder: 0,
      muted: null,
      autoplay: null,
      startAt: null,
      endAt: null,
      description: null,
      posterBlockId: null,
      fullsize: null,
      videoId: null,
      videoVariantLanguageId: null,
      source: 'internal' as any,
      title: null,
      duration: null,
      image: null,
      objectFit: null,
      mediaVideo: null,
      action: {
        __typename: 'LinkAction',
        parentBlockId: '1',
        gtmEventName: null,
        url: 'https://example.com',
        customizable: true,
        parentStepId: null
      }
    } as VideoBlock

    const result = checkBlocksForCustomizableLinks([videoBlock])
    expect(result).toBe(true)
  })

  it('should return true for VideoTriggerBlock with customizable triggerAction', () => {
    const videoTriggerBlock = {
      __typename: 'VideoTriggerBlock',
      id: '1',
      parentBlockId: null,
      parentOrder: 0,
      triggerStart: 5,
      triggerAction: {
        __typename: 'LinkAction',
        parentBlockId: '1',
        gtmEventName: null,
        url: 'https://example.com',
        customizable: true,
        parentStepId: null
      }
    } as VideoTriggerBlock

    const result = checkBlocksForCustomizableLinks([videoTriggerBlock])
    expect(result).toBe(true)
  })

  describe('checkActionBlock function', () => {
    it('should return false for null action', () => {
      const buttonBlock = {
        __typename: 'ButtonBlock',
        id: '1',
        parentBlockId: null,
        parentOrder: 0,
        label: 'Test Button',
        buttonVariant: null,
        buttonColor: null,
        size: null,
        startIconId: null,
        endIconId: null,
        submitEnabled: null,
        action: null,
        settings: null
      } as ButtonBlock

      const result = checkBlocksForCustomizableLinks([buttonBlock])
      expect(result).toBe(false)
    })

    it('should return false for actions that are not links or emails', () => {
      const buttonBlock = {
        __typename: 'ButtonBlock',
        id: '1',
        parentBlockId: null,
        parentOrder: 0,
        label: 'Test Button',
        buttonVariant: null,
        buttonColor: null,
        size: null,
        startIconId: null,
        endIconId: null,
        submitEnabled: null,
        action: {
          __typename: 'NavigateToBlockAction',
          parentBlockId: '1',
          gtmEventName: null,
          blockId: 'block-1'
        },
        settings: null
      } as ButtonBlock

      const result = checkBlocksForCustomizableLinks([buttonBlock])
      expect(result).toBe(false)
    })
  })
})
