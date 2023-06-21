import { ReactElement, useState } from 'react'
import Accordion from '@mui/material/Accordion'
import { JourneyFields_chatButtons as ChatButton } from '../../../../../../../../../__generated__/JourneyFields'
import { ChatPlatform } from '../../../../../../../../../__generated__/globalTypes'
import { Summary } from './Summary'
import { Details } from './Details'

interface Props {
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
}: Props): ReactElement {
  const [currentLink, setCurrentLink] = useState<string>(chatButton?.link ?? '')
  const [currentPlatform, setCurrentPlatform] = useState<ChatPlatform>(
    platform ?? chatButton?.platform ?? ChatPlatform.custom
  )

  return (
    <Accordion
      disableGutters
      square
      sx={{
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        borderTop: 0
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
