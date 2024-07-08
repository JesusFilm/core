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

  it('returns Globe 2', () => {
    expect(messagePlatformToLabel(MessagePlatform.globe2, t)).toBe('Globe 1')
  })

  it('returns Globe 3', () => {
    expect(messagePlatformToLabel(MessagePlatform.globe3, t)).toBe('Globe 2')
  })

  it('returns Message Text 1', () => {
    expect(messagePlatformToLabel(MessagePlatform.messageText1, t)).toBe(
      'Message Text Circle'
    )
  })

  it('returns Message Text 2', () => {
    expect(messagePlatformToLabel(MessagePlatform.messageText2, t)).toBe(
      'Message Text Square'
    )
  })

  it('returns Send 1', () => {
    expect(messagePlatformToLabel(MessagePlatform.send1, t)).toBe('Send 1')
  })

  it('returns Send 2', () => {
    expect(messagePlatformToLabel(MessagePlatform.send2, t)).toBe('Send 2')
  })

  it('returns Message Chat 2', () => {
    expect(messagePlatformToLabel(MessagePlatform.messageChat2, t)).toBe(
      'Message Chat Circle'
    )
  })

  it('returns Message Circle', () => {
    expect(messagePlatformToLabel(MessagePlatform.messageCircle, t)).toBe(
      'Message Circle'
    )
  })

  it('returns Message Notify Circle', () => {
    expect(messagePlatformToLabel(MessagePlatform.messageNotifyCircle, t)).toBe(
      'Message Notify Circle'
    )
  })

  it('returns Message Notify Square', () => {
    expect(messagePlatformToLabel(MessagePlatform.messageNotifySquare, t)).toBe(
      'Message Notify Square'
    )
  })

  it('returns Message Square', () => {
    expect(messagePlatformToLabel(MessagePlatform.messageSquare, t)).toBe(
      'Message Square'
    )
  })

  it('returns Mail 1', () => {
    expect(messagePlatformToLabel(MessagePlatform.mail1, t)).toBe('Mail')
  })

  it('returns Link External', () => {
    expect(messagePlatformToLabel(MessagePlatform.linkExternal, t)).toBe(
      'Link External'
    )
  })

  it('returns Home 3', () => {
    expect(messagePlatformToLabel(MessagePlatform.home3, t)).toBe('Home 1')
  })

  it('returns Home 4', () => {
    expect(messagePlatformToLabel(MessagePlatform.home4, t)).toBe('Home 2')
  })

  it('returns Help Circle', () => {
    expect(messagePlatformToLabel(MessagePlatform.helpCircleContained, t)).toBe(
      'Help Circle'
    )
  })

  it('returns Help Square', () => {
    expect(messagePlatformToLabel(MessagePlatform.helpSquareContained, t)).toBe(
      'Help Square'
    )
  })

  it('returns Shield Check', () => {
    expect(messagePlatformToLabel(MessagePlatform.shieldCheck, t)).toBe(
      'Shield Check'
    )
  })

  it('returns Menu', () => {
    expect(messagePlatformToLabel(MessagePlatform.menu1, t)).toBe('Menu')
  })

  it('returns Check Broken', () => {
    expect(messagePlatformToLabel(MessagePlatform.checkBroken, t)).toBe(
      'Check Broken'
    )
  })

  it('returns Check Contained', () => {
    expect(messagePlatformToLabel(MessagePlatform.checkContained, t)).toBe(
      'Check Contained'
    )
  })

  it('returns Settings', () => {
    expect(messagePlatformToLabel(MessagePlatform.settings, t)).toBe('Settings')
  })
})
