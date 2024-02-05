import Accordion from '@mui/material/Accordion'
import { ReactElement, useEffect, useState } from 'react'

import { ChatPlatform } from '../../../../../../../../../__generated__/globalTypes'
import { JourneyFields_chatButtons as ChatButton } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { Details } from './Details'
import { Summary } from './Summary'
import { ChatButtonType } from 'libs/journeys/ui/__generated__/globalTypes'

export type ChatButtonState = {
  type: string
  link: string
  code: string | null
  platform: ChatPlatform
}

interface ChatOptionProps {
  title: string
  chatButton?: ChatButton
  platform?: ChatPlatform
  active: boolean
  helperInfo?: string
  journeyId?: string
  disableSelection: boolean
  enableIconSelect?: boolean
  enableTypeToggle?: boolean
}
export function ChatOption({
  title,
  chatButton,
  platform,
  active,
  helperInfo,
  journeyId,
  disableSelection,
  enableIconSelect = false,
  enableTypeToggle = false
}: ChatOptionProps): ReactElement {
  const [buttonState, setButtonState] = useState<ChatButtonState>({
    type: chatButton?.type ?? ChatButtonType.link,
    link: chatButton?.link ?? '',
    code: chatButton?.code ?? '',
    platform: platform ?? chatButton?.platform ?? ChatPlatform.custom
  })
  const [expanded, setExpanded] = useState(false)
  function handleChange(): void {
    setExpanded(!expanded)
  }

  return (
    <Accordion
      expanded={expanded}
      onChange={handleChange}
      disableGutters
      square
      sx={{
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        borderTop: 0,
        borderLeft: 0,
        borderRight: 0
      }}
      data-testId="ChatOption"
    >
      <Summary
        title={title}
        active={active}
        disableSelection={disableSelection}
        journeyId={journeyId}
        buttonState={buttonState}
        chatButtonId={chatButton?.id}
        openAccordion={() => setExpanded(true)}
      />
      <Details
        journeyId={journeyId}
        chatButtonId={chatButton?.id}
        helperInfo={helperInfo}
        enableIconSelect={enableIconSelect}
        enableTypeToggle={enableTypeToggle}
        buttonState={buttonState}
        setButtonState={setButtonState}
      />
    </Accordion>
  )
}
