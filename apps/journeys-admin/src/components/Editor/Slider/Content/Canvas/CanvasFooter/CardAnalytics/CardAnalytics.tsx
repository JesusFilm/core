import { ChatIcon } from '@core/journeys/ui/ChatIcon/ChatIcon'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ThumbsDownIcon from '@core/shared/ui/icons/ThumbsDown'
import ThumbsUpIcon from '@core/shared/ui/icons/ThumbsUp'
import { Box, Typography } from '@mui/material'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { ReactElement, ReactNode } from 'react'
import { MessagePlatform } from '../../../../../../../../__generated__/globalTypes'

interface StatsProps {
  value: number
  icon: ReactNode
}

export function CardAnalytics(): ReactElement {
  const {
    state: { selectedStep, analytics }
  } = useEditor()
  const { journey } = useJourney()

  const step = analytics?.stepMap.get(selectedStep?.id ?? '')

  const thumbsUpClicks = step?.eventMap.get('footerThumbsUpButtonClick') ?? 0
  const thumbsDownClicks =
    step?.eventMap.get('footerThumbsDownButtonClick') ?? 0

  const primaryChat = journey?.chatButtons[0]
  const secondaryChat = journey?.chatButtons[1]
  const primaryChatClicks =
    analytics?.targetMap.get(
      `${selectedStep?.id}->link:${primaryChat?.link ?? ''}:${primaryChat?.platform ?? MessagePlatform.custom}`
    ) ?? 0
  const secondaryChatClicks =
    analytics?.targetMap.get(
      `${selectedStep?.id}->link:${secondaryChat?.link}:${secondaryChat?.platform ?? MessagePlatform.custom}`
    ) ?? 0

  return (
    <Stack
      direction="row"
      sx={{ justifyContent: 'space-between', width: '90%' }}
    >
      <Analytic
        value={thumbsUpClicks}
        icon={<ThumbsUpIcon sx={{ fontSize: 24 }} />}
      />
      <Divider orientation="vertical" flexItem />
      <Analytic
        value={thumbsDownClicks}
        icon={<ThumbsDownIcon sx={{ fontSize: 24 }} />}
      />
      {primaryChat != null && (
        <>
          <Divider orientation="vertical" flexItem />
          <Analytic
            value={primaryChatClicks}
            icon={
              <ChatIcon
                platform={primaryChat.platform ?? MessagePlatform.custom}
                sx={{ fontSize: 24 }}
              />
            }
          />
        </>
      )}
      {secondaryChat != null && (
        <>
          <Divider orientation="vertical" flexItem />
          <Analytic
            value={secondaryChatClicks}
            icon={
              <ChatIcon
                platform={secondaryChat.platform ?? MessagePlatform.custom}
                sx={{ fontSize: 24 }}
              />
            }
          />
        </>
      )}
    </Stack>
  )
}

function Analytic({ value, icon }: StatsProps): ReactElement {
  return (
    <Stack direction="row" gap={2} sx={{ p: 3 }}>
      {icon}
      <Typography variant="subtitle1">{value}</Typography>
    </Stack>
  )
}
