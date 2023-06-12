import { ChatButton } from '../types'
import { PlatformDetails } from '../../ChatOption/ChatOption'

export function getChatButton(
  id: string,
  chatButtons: PlatformDetails[]
): ChatButton | undefined {
  const chatButton = chatButtons.find((chatButton) => chatButton.id === id)
  if (chatButton != null) {
    return {
      id: chatButton.id,
      chatIcon: chatButton.chatIcon,
      chatLink: chatButton.linkValue
    }
  }
}
