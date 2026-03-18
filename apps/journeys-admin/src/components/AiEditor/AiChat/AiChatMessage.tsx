import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { JourneySimple } from '@core/shared/ai/journeySimpleTypes'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  proposedJourney?: JourneySimple
  generationId: number
  applied?: boolean
  dismissed?: boolean
  diffSummary?: string[]
}

interface AiChatMessageProps {
  message: ChatMessage
  currentGenerationId: number
  onApply: (message: ChatMessage) => void
  onDismiss: (message: ChatMessage) => void
  applying?: boolean
}

export function AiChatMessage({
  message,
  currentGenerationId,
  onApply,
  onDismiss,
  applying
}: AiChatMessageProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const isUser = message.role === 'user'
  const isStale = message.generationId !== currentGenerationId
  const hasProposal =
    message.proposedJourney != null && !message.applied && !message.dismissed

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2
      }}
    >
      <Box sx={{ maxWidth: '85%' }}>
        <Paper
          elevation={0}
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: isUser ? 'primary.main' : 'background.default',
            color: isUser ? 'primary.contrastText' : 'text.primary',
            borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            border: isUser ? 'none' : 1,
            borderColor: 'divider'
          }}
        >
          {!isUser && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mb: 0.5
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 14, color: 'primary.main' }} />
              <Typography variant="caption" color="primary" fontWeight={600}>
                {t('AI Assistant')}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {message.content}
          </Typography>
        </Paper>

        {hasProposal && (
          <Paper
            elevation={0}
            sx={{
              mt: 1,
              p: 2,
              border: 1,
              borderColor: isStale ? 'divider' : 'primary.main',
              borderRadius: 2,
              bgcolor: 'background.paper'
            }}
          >
            {isStale ? (
              <Typography variant="caption" color="text.secondary">
                {t('This proposal is outdated')}
              </Typography>
            ) : (
              <>
                <Typography
                  variant="caption"
                  color="primary"
                  fontWeight={600}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    mb: 1
                  }}
                >
                  <AutoAwesomeIcon sx={{ fontSize: 12 }} />
                  {t('Proposed changes')}
                </Typography>
                {message.diffSummary != null &&
                  message.diffSummary.length > 0 && (
                    <Box sx={{ mb: 1.5 }}>
                      {message.diffSummary.map((item, i) => (
                        <Typography
                          key={i}
                          variant="caption"
                          component="div"
                          color="text.secondary"
                        >
                          • {item}
                        </Typography>
                      ))}
                    </Box>
                  )}
                <Divider sx={{ mb: 1.5 }} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => onApply(message)}
                    disabled={applying}
                    startIcon={
                      applying ? <CircularProgress size={12} /> : undefined
                    }
                  >
                    {applying ? t('Applying...') : t('Apply Changes')}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    onClick={() => onDismiss(message)}
                    disabled={applying}
                  >
                    {t('Dismiss')}
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        )}

        {message.applied === true && (
          <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
            {t('✓ Applied')}
          </Typography>
        )}
        {message.dismissed === true && (
          <Typography variant="caption" color="text.disabled" sx={{ ml: 1 }}>
            {t('Dismissed')}
          </Typography>
        )}
      </Box>
    </Box>
  )
}
