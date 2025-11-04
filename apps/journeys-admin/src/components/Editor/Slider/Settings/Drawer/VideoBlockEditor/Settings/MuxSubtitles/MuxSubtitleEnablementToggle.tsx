import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface MuxSubtitleEnablementToggleProps {
  disabled?: boolean
}

export function MuxSubtitleEnablementToggle({
  disabled = false
}: MuxSubtitleEnablementToggleProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Stack direction="column" spacing={2}>
      <Stack direction="row" justifyContent="space-between">
        <Switch
          checked={false}
          disabled={disabled}
          inputProps={{
            'aria-label': 'Subtitles'
          }}
        />
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {t('Subtitles not available for this video')}
      </Typography>
    </Stack>
  )
}
