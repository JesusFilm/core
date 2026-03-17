import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface AiEditorHeaderProps {
  journeyId: string
  journeyTitle: string
}

export function AiEditorHeader({
  journeyId,
  journeyTitle
}: AiEditorHeaderProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        height: 56,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        flexShrink: 0,
        gap: 2
      }}
    >
      <Tooltip title={t('Back to journeys')} arrow>
        <IconButton
          component={NextLink}
          href="/?type=journeys"
          size="small"
          data-testid="AiEditorBackButton"
        >
          <ArrowBackRoundedIcon />
        </IconButton>
      </Tooltip>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flex: 1,
          minWidth: 0
        }}
      >
        <AutoAwesomeIcon color="primary" sx={{ fontSize: 20, flexShrink: 0 }} />
        <Typography
          variant="h6"
          noWrap
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {journeyTitle}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ flexShrink: 0 }}
        >
          — {t('AI Editor')}
        </Typography>
      </Box>

      <Tooltip title={t('Switch to manual editor')} arrow>
        <Button
          component={NextLink}
          href={`/journeys/${journeyId}`}
          size="small"
          variant="outlined"
          data-testid="AiEditorSwitchButton"
        >
          {t('Manual Editor')}
        </Button>
      </Tooltip>
    </Box>
  )
}
