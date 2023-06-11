import { Platform } from '../../AccordionItem/AccordionItem'
import { ChatButton } from '../../ChatWidget'

export function getByPlatform(
  chatButtons: ChatButton[],
  platform?: Platform
): ChatButton | undefined {
  let res: ChatButton | undefined
  if (platform == null) {
    res = chatButtons.find(
      (chatButton) =>
        chatButton.chatIcon !== Platform.facebook &&
        chatButton.chatIcon !== Platform.whatsApp &&
        chatButton.chatIcon !== Platform.telegram &&
        chatButton.chatIcon !== Platform.line
    )
  } else {
    res = chatButtons.find((chatButton) => chatButton.chatIcon === platform)
  }
  return res
}
