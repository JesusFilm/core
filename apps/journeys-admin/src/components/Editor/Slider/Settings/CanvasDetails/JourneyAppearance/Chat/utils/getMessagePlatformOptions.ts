import { TFunction } from 'i18next'

import { MessagePlatform } from '../../../../../../../../../__generated__/globalTypes'

interface MessagePlatformOption {
  value: MessagePlatform
  label: string
}

// Platforms with their own dedicated chat option rows in the editor
const DEDICATED_PLATFORMS = new Set<MessagePlatform>([
  MessagePlatform.facebook,
  MessagePlatform.whatsApp,
  MessagePlatform.telegram
])

/**
 * Returns the list of active message platform options for chat widget dropdowns.
 * @param options.excludeDedicated - When true, filters out platforms (e.g. WhatsApp,
 * Messenger, Telegram) that already have their own dedicated chat option rows in the
 * editor, avoiding duplicate entries in the icon picker.
 */
export function getMessagePlatformOptions(
  t: TFunction<'apps-journeys-admin', undefined>,
  options?: { excludeDedicated?: boolean }
): MessagePlatformOption[] {
  const allOptions: MessagePlatformOption[] = [
    // Social/messaging platforms (alphabetical)
    { value: MessagePlatform.discord, label: t('Discord') },
    { value: MessagePlatform.instagram, label: t('Instagram') },
    { value: MessagePlatform.kakaoTalk, label: t('KakaoTalk') },
    { value: MessagePlatform.line, label: t('LINE') },
    { value: MessagePlatform.facebook, label: t('Messenger') },
    { value: MessagePlatform.signal, label: t('Signal') },
    { value: MessagePlatform.snapchat, label: t('Snapchat') },
    { value: MessagePlatform.telegram, label: t('Telegram') },
    { value: MessagePlatform.tikTok, label: t('TikTok') },
    { value: MessagePlatform.viber, label: t('Viber') },
    { value: MessagePlatform.weChat, label: t('WeChat') },
    { value: MessagePlatform.whatsApp, label: t('WhatsApp') },
    // Generic icons
    { value: MessagePlatform.custom, label: t('Chat') },
    { value: MessagePlatform.globe3, label: t('Globe') },
    { value: MessagePlatform.helpCircleContained, label: t('Help Circle') },
    { value: MessagePlatform.mail1, label: t('Mail') }
  ]

  if (options?.excludeDedicated === true) {
    return allOptions.filter((option) => !DEDICATED_PLATFORMS.has(option.value))
  }

  return allOptions
}
