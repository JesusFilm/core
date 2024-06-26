import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { MessageChatIcon } from '@core/journeys/ui/MessageChatIcon'
import ThumbsDownIcon from '@core/shared/ui/icons/ThumbsDown'
import ThumbsUpIcon from '@core/shared/ui/icons/ThumbsUp'
import { Typography } from '@mui/material'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { ReactElement, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { MessagePlatform } from '../../../../../../../../__generated__/globalTypes'

export function CardAnalytics(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
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
      data-testid="CardAnalytics"
      direction="row"
      sx={{ justifyContent: 'space-between', width: '90%' }}
    >
      <Analytic
        title={t('likes')}
        value={thumbsUpClicks}
        icon={<ThumbsUpIcon sx={{ fontSize: 24 }} />}
      />
      <Divider orientation="vertical" flexItem />
      <Analytic
        title={t('dislikes')}
        value={thumbsDownClicks}
        icon={<ThumbsDownIcon sx={{ fontSize: 24 }} />}
      />
      {primaryChat != null && (
        <>
          <Divider orientation="vertical" flexItem />
          <Analytic
            title={t('widget clicks')}
            value={primaryChatClicks}
            icon={
              <MessageChatIcon
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
            title={t('widget clicks')}
            value={secondaryChatClicks}
            icon={
              <MessageChatIcon
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
    <Tooltip title={`${value} ${title}`} placement="bottom">
      <Stack direction="row" gap={2} sx={{ p: 3 }}>
        {icon}
        <Typography variant="subtitle1">{value}</Typography>
      </Stack>
    </Tooltip>
  )
}
