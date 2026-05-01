import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import {
  ASSISTANT_FG,
  DIVIDER,
  PRIMARY_ON,
  SPARKLE_AVATAR_SHADOW,
  SPARKLE_GRADIENT,
  TEXT_SECONDARY
} from '../tokens'

interface ChatHeaderProps {
  /** When provided renders a close button on the right (used by takeover surfaces). */
  onClose?: () => void
}

export function ChatHeader({ onClose }: ChatHeaderProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')

  return (
    <Box
      data-testid="ChatHeader"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        pt: 1,
        pb: 1.5,
        px: 1.75,
        borderBottom: `1px solid ${DIVIDER}`,
        flexShrink: 0
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: SPARKLE_GRADIENT,
          color: PRIMARY_ON,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: SPARKLE_AVATAR_SHADOW,
          flexShrink: 0
        }}
      >
        <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle1"
          sx={{
            color: ASSISTANT_FG,
            fontSize: 14,
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: 2
          }}
        >
          {t('Ask a question')}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            color: TEXT_SECONDARY,
            fontSize: 12,
            lineHeight: '20px',
            letterSpacing: 0
          }}
        >
          {t('Replies may not be perfect')}
        </Typography>
      </Box>
      {onClose != null && (
        <IconButton
          onClick={onClose}
          aria-label={t('Close chat')}
          tabIndex={0}
          sx={{
            width: 28,
            height: 28,
            color: TEXT_SECONDARY,
            '&:hover': { bgcolor: 'transparent', color: ASSISTANT_FG }
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      )}
    </Box>
  )
}
