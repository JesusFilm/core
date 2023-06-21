import { MessagePlatform } from '../../../../../../__generated__/globalTypes'
import { messagePlatformToLabel } from './messagePlatformToLabel'

describe('messagePlatformToLabel', () => {
  function t(string: string): string {
    return string
  }

  it('returns Facebook', () => {
    expect(messagePlatformToLabel(MessagePlatform.facebook, t)).toEqual(
      'Facebook'
    )
  })

  it('returns Instagram', () => {
    expect(messagePlatformToLabel(MessagePlatform.instagram, t)).toEqual(
      'Instagram'
    )
  })

  it('returns LINE', () => {
    expect(messagePlatformToLabel(MessagePlatform.line, t)).toEqual('LINE')
  })

  it('returns Skype', () => {
    expect(messagePlatformToLabel(MessagePlatform.skype, t)).toEqual('Skype')
  })

  it('returns Snapchat', () => {
    expect(messagePlatformToLabel(MessagePlatform.snapchat, t)).toEqual(
      'Snapchat'
    )
  })

  it('returns Telegram', () => {
    expect(messagePlatformToLabel(MessagePlatform.telegram, t)).toEqual(
      'Telegram'
    )
  })

  it('returns TikTok', () => {
    expect(messagePlatformToLabel(MessagePlatform.tikTok, t)).toEqual('TikTok')
  })

  it('returns Viber', () => {
    expect(messagePlatformToLabel(MessagePlatform.viber, t)).toEqual('Viber')
  })

  it('returns VK', () => {
    expect(messagePlatformToLabel(MessagePlatform.vk, t)).toEqual('VK')
  })

  it('returns WhatsApp', () => {
    expect(messagePlatformToLabel(MessagePlatform.whatsApp, t)).toEqual(
      'WhatsApp'
    )
  })

  it('returns Custom', () => {
    expect(messagePlatformToLabel(MessagePlatform.custom, t)).toEqual('Custom')
  })
})
