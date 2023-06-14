import { ChatPlatform } from '../../../../../../../../../../__generated__/globalTypes'
import { GetJourneyChatButtons_journey_chatButtons as ChatButton } from '../../../../../../../../../../__generated__/GetJourneyChatButtons'

export function getByPlatform(
  chatButtons: ChatButton[],
  platform?: ChatPlatform
): ChatButton | undefined {
  let res: ChatButton | undefined
  if (platform == null) {
    res = chatButtons.find(
      (chatButton) =>
        chatButton.platform !== ChatPlatform.facebook &&
        chatButton.platform !== ChatPlatform.whatsApp &&
        chatButton.platform !== ChatPlatform.telegram
    )
  } else {
    res = chatButtons.find((chatButton) => chatButton.platform === platform)
  }
  return res
}
