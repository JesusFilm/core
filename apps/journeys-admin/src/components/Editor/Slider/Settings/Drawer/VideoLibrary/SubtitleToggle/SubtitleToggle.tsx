import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

export interface SubtitleToggleProps {
  subtitleEnabled: boolean
  onSubtitleToggle: (enabled: boolean) => void
  hasSubtitles?: boolean
  disabled?: boolean
}

export function SubtitleToggle({
  subtitleEnabled,
  onSubtitleToggle,
  hasSubtitles = true,
  disabled = false
}: SubtitleToggleProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [showTooltip, setShowTooltip] = useState(false)

  const handleSubtitleToggle = (): void => {
    if (hasSubtitles) {
      onSubtitleToggle(!subtitleEnabled)
    } else {
      // Show tooltip when trying to toggle without available subtitles
      setShowTooltip(true)
      setTimeout(() => {
        setShowTooltip(false)
      }, 3000) // Hide tooltip after 3 seconds
    }
  }

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
      }}
    >
      <Typography variant="caption">{t('Enable Subtitles')}</Typography>
      <Tooltip
        open={showTooltip}
        title={t('This video does not have any subtitles.')}
        placement="top"
      >
        <Box>
          <Switch
            checked={subtitleEnabled && hasSubtitles}
            onChange={handleSubtitleToggle}
            disabled={disabled}
            inputProps={{ 'aria-label': t('Enable Subtitles') }}
          />
        </Box>
      </Tooltip>
    </Stack>
  )
}
