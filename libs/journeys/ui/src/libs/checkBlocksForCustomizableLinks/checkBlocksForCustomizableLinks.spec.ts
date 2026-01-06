import {
  JourneyFields_blocks as Block,
  JourneyFields_blocks_ButtonBlock as ButtonBlock,
  JourneyFields_blocks_RadioOptionBlock as RadioOptionBlock,
  JourneyFields_blocks_VideoBlock as VideoBlock,
  JourneyFields_blocks_VideoTriggerBlock as VideoTriggerBlock
} from '../JourneyProvider/__generated__/JourneyFields'

import { checkBlocksForCustomizableLinks } from './checkBlocksForCustomizableLinks'

describe('checkBlocksForCustomizableLinks', () => {
  const nonCustomizableButtonBlock: ButtonBlock = {
    __typename: 'ButtonBlock',
    id: '1',
    parentBlockId: null,
    parentOrder: 0,
    label: 'Non-customizable Button',
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
    settings: null,
    eventLabel: null
  }

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
      id: '2',
      parentBlockId: null,
      parentOrder: 1,
      label: 'Test Button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      submitEnabled: null,
      action: {
        __typename: 'LinkAction',
        parentBlockId: '2',
        gtmEventName: null,
        url: 'https://example.com',
        customizable: true,
        parentStepId: null
      },
      settings: null,
      eventLabel: null
    } as ButtonBlock

    const result = checkBlocksForCustomizableLinks([
      nonCustomizableButtonBlock,
      buttonBlock
    ])
    expect(result).toBe(true)
  })

  it('should return true for ButtonBlock with customizable EmailAction', () => {
    const buttonBlock = {
      __typename: 'ButtonBlock',
      id: '2',
      parentBlockId: null,
      parentOrder: 1,
      label: 'Test Button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      submitEnabled: null,
      action: {
        __typename: 'EmailAction',
        parentBlockId: '2',
        gtmEventName: null,
        email: 'test@example.com',
        customizable: true,
        parentStepId: null
      },
      settings: null,
      eventLabel: null
    } as ButtonBlock

    const result = checkBlocksForCustomizableLinks([
      nonCustomizableButtonBlock,
      buttonBlock
    ])
    expect(result).toBe(true)
  })

  it('should return true for ButtonBlock with customizable PhoneAction', () => {
    const buttonBlock = {
      __typename: 'ButtonBlock',
      id: '2',
      parentBlockId: null,
      parentOrder: 1,
      label: 'Test Button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      submitEnabled: null,
      action: {
        __typename: 'PhoneAction',
        parentBlockId: '2',
        gtmEventName: null,
        phone: '+1234567890',
        countryCode: 'US',
        contactAction: 'call' as any,
        customizable: true,
        parentStepId: null
      },
      settings: null,
      eventLabel: null
    } as ButtonBlock

    const result = checkBlocksForCustomizableLinks([
      nonCustomizableButtonBlock,
      buttonBlock
    ])
    expect(result).toBe(true)
  })

  it('should return true for ButtonBlock with customizable ChatAction', () => {
    const buttonBlock = {
      __typename: 'ButtonBlock',
      id: '2',
      parentBlockId: null,
      parentOrder: 1,
      label: 'Test Button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      submitEnabled: null,
      action: {
        __typename: 'ChatAction',
        parentBlockId: '2',
        gtmEventName: null,
        chatUrl: 'https://example.com/chat',
        target: null,
        customizable: true,
        parentStepId: null
      },
      settings: null,
      eventLabel: null
    } as ButtonBlock

    const result = checkBlocksForCustomizableLinks([
      nonCustomizableButtonBlock,
      buttonBlock
    ])
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
      settings: null,
      eventLabel: null
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
      settings: null,
      eventLabel: null
    } as ButtonBlock

    const result = checkBlocksForCustomizableLinks([buttonBlock])
    expect(result).toBe(false)
  })

  it('should return true for RadioOptionBlock with customizable LinkAction', () => {
    const radioOptionBlock = {
      __typename: 'RadioOptionBlock',
      id: '2',
      parentBlockId: null,
      parentOrder: 1,
      label: 'Test Option',
      action: {
        __typename: 'LinkAction',
        parentBlockId: '2',
        gtmEventName: null,
        url: 'https://example.com',
        customizable: true,
        parentStepId: null
      },
      pollOptionImageBlockId: null
    } as RadioOptionBlock

    const result = checkBlocksForCustomizableLinks([
      nonCustomizableButtonBlock,
      radioOptionBlock
    ])
    expect(result).toBe(true)
  })

  it('should return true for VideoBlock with customizable LinkAction', () => {
    const videoBlock = {
      __typename: 'VideoBlock',
      id: '2',
      parentBlockId: null,
      parentOrder: 1,
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
        parentBlockId: '2',
        gtmEventName: null,
        url: 'https://example.com',
        customizable: true,
        parentStepId: null
      }
    } as VideoBlock

    const result = checkBlocksForCustomizableLinks([
      nonCustomizableButtonBlock,
      videoBlock
    ])
    expect(result).toBe(true)
  })

  it('should return true for VideoTriggerBlock with customizable triggerAction', () => {
    const videoTriggerBlock = {
      __typename: 'VideoTriggerBlock',
      id: '2',
      parentBlockId: null,
      parentOrder: 1,
      triggerStart: 5,
      triggerAction: {
        __typename: 'LinkAction',
        parentBlockId: '2',
        gtmEventName: null,
        url: 'https://example.com',
        customizable: true,
        parentStepId: null
      }
    } as VideoTriggerBlock

    const result = checkBlocksForCustomizableLinks([
      nonCustomizableButtonBlock,
      videoTriggerBlock
    ])
    expect(result).toBe(true)
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
      settings: null,
      eventLabel: null
    } as ButtonBlock

    const result = checkBlocksForCustomizableLinks([buttonBlock])
    expect(result).toBe(false)
  })
})
