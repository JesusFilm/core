import { ChatIcon } from '@core/journeys/ui/ChatIcon/ChatIcon'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ThumbsDownIcon from '@core/shared/ui/icons/ThumbsDown'
import ThumbsUpIcon from '@core/shared/ui/icons/ThumbsUp'
import { Box, Typography } from '@mui/material'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { ReactElement, ReactNode } from 'react'
import { MessagePlatform } from '../../../../../../../../__generated__/globalTypes'

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
        title="likes"
        value={thumbsUpClicks}
        icon={<ThumbsUpIcon sx={{ fontSize: 24 }} />}
      />
      <Divider orientation="vertical" flexItem />
      <Analytic
        title="dislikes"
        value={thumbsDownClicks}
        icon={<ThumbsDownIcon sx={{ fontSize: 24 }} />}
      />
      {primaryChat != null && (
        <>
          <Divider orientation="vertical" flexItem />
          <Analytic
            title="widget clicks"
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
            title="widget clicks"
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

interface StatsProps {
  title: string
  value: number
  icon: ReactNode
}

function Analytic({ title, value, icon }: StatsProps): ReactElement {
  return (
    <Tooltip title={title} placement="bottom">
      <Stack direction="row" gap={2} sx={{ p: 3 }}>
        {icon}
        <Typography variant="subtitle1">{value}</Typography>
      </Stack>
    </Tooltip>
  )
}
