import { TFunction } from 'i18next'

import { MessagePlatform } from '../../../../../../../../../__generated__/globalTypes'

import { getMessagePlatformOptions } from './getMessagePlatformOptions'

describe('getMessagePlatformOptions', () => {
  const t = ((string: string): string => string) as unknown as TFunction<
    'apps-journeys-admin',
    undefined
  >

  it('returns all 16 platform options by default', () => {
    const options = getMessagePlatformOptions(t)

    expect(options).toHaveLength(16)
    expect(options.map((o) => o.value)).toEqual([
      MessagePlatform.discord,
      MessagePlatform.instagram,
      MessagePlatform.kakaoTalk,
      MessagePlatform.line,
      MessagePlatform.facebook,
      MessagePlatform.signal,
      MessagePlatform.snapchat,
      MessagePlatform.telegram,
      MessagePlatform.tikTok,
      MessagePlatform.viber,
      MessagePlatform.weChat,
      MessagePlatform.whatsApp,
      MessagePlatform.custom,
      MessagePlatform.globe3,
      MessagePlatform.helpCircleContained,
      MessagePlatform.mail1
    ])
  })

  it('returns 13 options when excludeDedicated is true', () => {
    const options = getMessagePlatformOptions(t, { excludeDedicated: true })

    expect(options).toHaveLength(13)

    const values = options.map((o) => o.value)
    expect(values).not.toContain(MessagePlatform.facebook)
    expect(values).not.toContain(MessagePlatform.whatsApp)
    expect(values).not.toContain(MessagePlatform.telegram)
  })

  it('uses correct labels for renamed platforms', () => {
    const options = getMessagePlatformOptions(t)

    const facebookOption = options.find(
      (o) => o.value === MessagePlatform.facebook
    )
    expect(facebookOption?.label).toBe('Messenger')

    const globeOption = options.find((o) => o.value === MessagePlatform.globe3)
    expect(globeOption?.label).toBe('Globe')
  })

  it('includes new platforms', () => {
    const options = getMessagePlatformOptions(t)
    const values = options.map((o) => o.value)

    expect(values).toContain(MessagePlatform.discord)
    expect(values).toContain(MessagePlatform.signal)
    expect(values).toContain(MessagePlatform.weChat)
  })
})
