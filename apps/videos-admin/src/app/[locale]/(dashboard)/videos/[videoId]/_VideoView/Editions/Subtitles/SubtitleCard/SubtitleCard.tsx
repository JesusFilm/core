import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { ActionButton } from '../../../../../../../../../components/ActionButton'
import { GetAdminVideo_AdminVideo_VideoEditions } from '../../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { ArrayElement } from '../../../../../../../../../types/array-types'

type Edition = ArrayElement<GetAdminVideo_AdminVideo_VideoEditions>
type Subtitle = ArrayElement<Edition['videoSubtitles']>

interface SubtitleCardProps {
  subtitle: Subtitle
  onClick: () => void
  actions?: any
}

export function SubtitleCard({
  subtitle,
  onClick,
  actions
}: SubtitleCardProps): ReactElement {
  const t = useTranslations()
  return (
    <Box
      sx={{
        p: 1,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        minWidth: 200,
        bgcolor: 'background.paper',
        '&:hover': {
          borderColor: 'action.hover',
          cursor: 'pointer'
        }
      }}
      onClick={onClick}
    >
      <Stack
        sx={{
          p: 1,
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="h6">{subtitle.language.name[0].value}</Typography>
        <ActionButton actions={actions} />
      </Stack>
      <Stack direction="row" alignItems="center" gap={1}>
        {subtitle.primary && (
          <Chip label={t('Primary')} color="success" variant="filled" />
        )}
      </Stack>
    </Box>
  )
}
