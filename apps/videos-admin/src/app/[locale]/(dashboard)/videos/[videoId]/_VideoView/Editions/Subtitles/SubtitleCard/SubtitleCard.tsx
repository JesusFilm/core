import { ReactElement } from 'react'
import { ArrayElement } from '../../../../../../../../../types/array-types'
import { GetAdminVideo_AdminVideo_VideoEditions } from '../../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useTranslations } from 'next-intl'
import { Box } from '@mui/material'
import { Stack } from '@mui/material'
import { Typography } from '@mui/material'
import { Chip } from '@mui/material'

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
      <Stack direction="row" alignItems="center" gap={1}>
        <Typography variant="h6">{subtitle.language.name[0].value}</Typography>
        {subtitle.primary && (
          <Chip label={t('Primary')} color="success" variant="filled" />
        )}
      </Stack>
    </Box>
  )
}
