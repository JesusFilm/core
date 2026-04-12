import { ReactElement, useState } from 'react'

import { MessagePlatform } from '../../../../../../../../../__generated__/globalTypes'
import { JourneyFields_chatButtons as ChatButton } from '../../../../../../../../../__generated__/JourneyFields'

import { Details } from './Details'
import { Summary } from './Summary'

interface ChatOptionProps {
  title: string
  chatButton?: ChatButton
  platform?: MessagePlatform
  active: boolean
  helperInfo?: string
  journeyId?: string
  disableSelection: boolean
  enableIconSelect?: boolean
}
export function ChatOption({
  title,
  chatButton,
  platform,
  active,
  helperInfo,
  journeyId,
  disableSelection,
  enableIconSelect = false
}: ChatOptionProps): ReactElement {
  const [trackedId, setTrackedId] = useState(chatButton?.id)
  const [currentLink, setCurrentLink] = useState(chatButton?.link ?? '')
  const [currentPlatform, setCurrentPlatform] = useState(
    platform ?? chatButton?.platform ?? MessagePlatform.custom
  )

  // Sync local state when a different button shifts into this slot.
  // When chatButton is undefined (deselected), the guard preserves
  // local state so Summary can reuse it to re-create the button.
  if (chatButton != null && chatButton.id !== trackedId) {
    setTrackedId(chatButton.id)
    setCurrentLink(chatButton.link ?? '')
    setCurrentPlatform(chatButton.platform ?? MessagePlatform.custom)
  }

  return (
    <>
      <Summary
        title={title}
        active={active}
        disableSelection={disableSelection}
        journeyId={journeyId}
        currentLink={currentLink}
        currentPlatform={currentPlatform}
        chatButtonId={chatButton?.id}
      />
      <Details
        journeyId={journeyId}
        chatButtonId={chatButton?.id}
        currentPlatform={currentPlatform}
        currentLink={currentLink}
        currentCustomizable={chatButton?.customizable ?? null}
        active={active}
        setCurrentPlatform={setCurrentPlatform}
        setCurrentLink={setCurrentLink}
        helperInfo={helperInfo}
        enableIconSelect={enableIconSelect}
      />
    </>
  )
}
