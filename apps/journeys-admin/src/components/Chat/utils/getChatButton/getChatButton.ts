import { GetJourneyChatButtons_journey_chatButtons as ChatButton } from '../../../../../__generated__/GetJourneyChatButtons'
import { PlatformDetails } from '../../ChatOption/ChatOption'

export function getChatButton(
  id: string,
  chatButtons: PlatformDetails[]
): Omit<ChatButton, '__typename'> | undefined {
  const chatButton = chatButtons.find((chatButton) => chatButton.id === id)
  if (chatButton != null) {
    return {
      id: chatButton.id,
      platform: chatButton.platform ?? null,
      link: chatButton.link ?? null
    }
  }
}
