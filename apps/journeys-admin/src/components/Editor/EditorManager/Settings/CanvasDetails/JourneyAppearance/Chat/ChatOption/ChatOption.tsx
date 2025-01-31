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
  const [currentLink, setCurrentLink] = useState(chatButton?.link ?? '')
  const [currentPlatform, setCurrentPlatform] = useState(
    platform ?? chatButton?.platform ?? MessagePlatform.custom
  )

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
        setCurrentPlatform={setCurrentPlatform}
        setCurrentLink={setCurrentLink}
        helperInfo={helperInfo}
        enableIconSelect={enableIconSelect}
      />
    </>
  )
}
