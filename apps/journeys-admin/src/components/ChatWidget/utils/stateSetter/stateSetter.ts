import { SetStateAction } from 'react'
import { PlatformDetails } from '../../AccordionItem/AccordionItem'
import { ChatButton } from '../../ChatWidget'

export function stateSetter(
  setState: (state: SetStateAction<PlatformDetails>) => void,
  chatButton?: ChatButton
): void {
  if (chatButton != null) {
    setState((prevState) => ({
      ...prevState,
      id: chatButton.id,
      chatIcon: chatButton.chatIcon,
      linkValue: chatButton.chatLink,
      active: true
    }))
  } else {
    setState((prevState) => ({
      ...prevState,
      active: false
    }))
  }
}
