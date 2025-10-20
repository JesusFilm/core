import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

export interface SubtitlePreviewToggleProps {
  subtitleEnabled: boolean
  onSubtitleToggle: (enabled: boolean) => void
  subtitleLanguageId: string | null
  disabled?: boolean
  loading?: boolean
}

export function SubtitlePreviewToggle({
  subtitleEnabled,
  onSubtitleToggle,
  subtitleLanguageId,
  disabled = false,
  loading = false
}: SubtitlePreviewToggleProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [showTooltip, setShowTooltip] = useState(false)

  const hasSubtitles = subtitleLanguageId != null

  const handleSubtitleToggle = (): void => {
    if (hasSubtitles) {
      onSubtitleToggle(!subtitleEnabled)
    }
  }

  const handleClickDisabled = (): void => {
    if (!hasSubtitles) {
      setShowTooltip(true)
      setTimeout(() => {
        setShowTooltip(false)
      }, 3000)
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
      <Typography
        variant="caption"
        sx={{
          fontWeight: subtitleEnabled && hasSubtitles ? 600 : 400,
          color:
            subtitleEnabled && hasSubtitles ? 'text.primary' : 'text.secondary'
        }}
      >
        {t('Preview with Subtitles')}
      </Typography>
      <Tooltip
        open={!hasSubtitles && showTooltip}
        title={t('No subtitles available')}
        placement="top"
        PopperProps={{
          container: () =>
            document.querySelector('.MuiDrawer-paper') || document.body,
          modifiers: [
            {
              name: 'preventOverflow',
              enabled: true,
              options: {
                boundary: 'clippingParents'
              }
            },
            {
              name: 'flip',
              enabled: true
            }
          ]
        }}
        slotProps={{
          tooltip: {
            sx: {
              maxWidth: 'min(125px, 45vw)',
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              textAlign: 'center',
              lineHeight: 1.4,
              padding: '8px 12px',
              backgroundColor: 'secondary.dark',
              fontSize: '12px',
              fontWeight: 400
            }
          }
        }}
      >
        <Box
          onClick={!hasSubtitles ? handleClickDisabled : undefined}
          onMouseEnter={!hasSubtitles ? () => setShowTooltip(true) : undefined}
          onMouseLeave={!hasSubtitles ? () => setShowTooltip(false) : undefined}
          sx={{ display: 'inline-flex' }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ m: 1.25 }} />
          ) : (
            <Switch
              checked={subtitleEnabled && hasSubtitles}
              onChange={handleSubtitleToggle}
              disabled={disabled || !hasSubtitles}
              inputProps={{ 'aria-label': t('Preview with Subtitles') }}
            />
          )}
        </Box>
      </Tooltip>
    </Stack>
  )
}
