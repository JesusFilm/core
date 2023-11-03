import Accordion from '@mui/material/Accordion'
import { ReactElement, useState } from 'react'

import { ChatPlatform } from '../../../../../../../../../__generated__/globalTypes'
import { JourneyFields_chatButtons as ChatButton } from '../../../../../../../../../__generated__/JourneyFields'

import { Details } from './Details'
import { Summary } from './Summary'

interface ChatOptionProps {
  title: string
  chatButton?: ChatButton
  platform?: ChatPlatform
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
    platform ?? chatButton?.platform ?? ChatPlatform.custom
  )
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
    >
      <Summary
        title={title}
        active={active}
        disableSelection={disableSelection}
        journeyId={journeyId}
        currentLink={currentLink}
        currentPlatform={currentPlatform}
        chatButtonId={chatButton?.id}
        openAccordion={() => setExpanded(true)}
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
    </Accordion>
  )
}
