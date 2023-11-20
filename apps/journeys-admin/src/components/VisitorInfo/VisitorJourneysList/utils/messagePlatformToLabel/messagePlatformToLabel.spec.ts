import { TFunction } from 'i18next'

import { MessagePlatform } from '../../../../../../__generated__/globalTypes'

import { messagePlatformToLabel } from './messagePlatformToLabel'

describe('messagePlatformToLabel', () => {
  const t = ((string): string => string) as unknown as TFunction<
    'apps-journeys-admin',
    undefined
  >

  it('returns Facebook', () => {
    expect(messagePlatformToLabel(MessagePlatform.facebook, t)).toBe('Facebook')
  })

  it('returns Instagram', () => {
    expect(messagePlatformToLabel(MessagePlatform.instagram, t)).toBe(
      'Instagram'
    )
  })

  it('returns LINE', () => {
    expect(messagePlatformToLabel(MessagePlatform.line, t)).toBe('LINE')
  })

  it('returns Skype', () => {
    expect(messagePlatformToLabel(MessagePlatform.skype, t)).toBe('Skype')
  })

  it('returns Snapchat', () => {
    expect(messagePlatformToLabel(MessagePlatform.snapchat, t)).toBe('Snapchat')
  })

  it('returns Telegram', () => {
    expect(messagePlatformToLabel(MessagePlatform.telegram, t)).toBe('Telegram')
  })

  it('returns TikTok', () => {
    expect(messagePlatformToLabel(MessagePlatform.tikTok, t)).toBe('TikTok')
  })

  it('returns Viber', () => {
    expect(messagePlatformToLabel(MessagePlatform.viber, t)).toBe('Viber')
  })

  it('returns VK', () => {
    expect(messagePlatformToLabel(MessagePlatform.vk, t)).toBe('VK')
  })

  it('returns WhatsApp', () => {
    expect(messagePlatformToLabel(MessagePlatform.whatsApp, t)).toBe('WhatsApp')
  })

  it('returns Custom', () => {
    expect(messagePlatformToLabel(MessagePlatform.custom, t)).toBe('Custom')
  })
})
