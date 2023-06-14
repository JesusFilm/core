import { SetStateAction } from 'react'
import { PlatformDetails } from '../../ChatOption/ChatOption'
import { GetJourneyChatButtons_journey_chatButtons as ChatButton } from '../../../../../../../../../../__generated__/GetJourneyChatButtons'

export function stateSetter(
  setState: (state: SetStateAction<PlatformDetails>) => void,
  chatButton?: ChatButton
): void {
  if (chatButton != null) {
    setState((prevState) => ({
      ...prevState,
      id: chatButton.id,
      chatIcon: chatButton.platform,
      linkValue: chatButton.link,
      active: true
    }))
  } else {
    setState((prevState) => ({
      ...prevState,
      active: false
    }))
  }
}
