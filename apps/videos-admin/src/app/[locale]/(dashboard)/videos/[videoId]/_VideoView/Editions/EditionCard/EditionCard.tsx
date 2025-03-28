import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'
import { ComponentProps, ReactElement } from 'react'

import { ActionButton } from '../../../../../../../../components/ActionButton'
import { GetAdminVideo_AdminVideo_VideoEdition as Edition } from '../../../../../../../../libs/useAdminVideo/useAdminVideo'

interface EditionCardProps {
  edition: Edition
  onClick: () => void
  actions: ComponentProps<typeof ActionButton>['actions']
}

export function EditionCard({
  edition,
  onClick,
  actions
}: EditionCardProps): ReactElement {
  const t = useTranslations()

  const menuActions = {
    ...actions,
    delete: edition.videoSubtitles.length === 0 ? actions.delete : undefined
  }

  return (
    <Box
      sx={{
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
      data-testid="EditionCard"
    >
      <Stack
        sx={{
          p: 1,
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="h4" sx={{ ml: 1 }}>
          {edition.name}
        </Typography>
        <ActionButton actions={menuActions} />
      </Stack>
      <Box sx={{ p: 2 }}>
        <Typography sx={{ color: 'text.secondary' }}>
          {edition.videoSubtitles.length} {t('subtitles')}
        </Typography>
      </Box>
    </Box>
  )
}
