import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import StopIcon from '@mui/icons-material/Stop'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback, useState } from 'react'

interface AiEditorToolbarProps {
  journeyTitle?: string
  isAiActive: boolean
  hasMessages: boolean
  onStopGeneration: () => void
}

export function AiEditorToolbar({
  journeyTitle,
  isAiActive,
  hasMessages,
  onStopGeneration
}: AiEditorToolbarProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const journeyId =
    typeof router.query.journeyId === 'string'
      ? router.query.journeyId
      : undefined

  const handleEditManuallyClick = useCallback(() => {
    if (hasMessages) {
      setConfirmOpen(true)
      return
    }
    void navigateToManualEditor()
  }, [hasMessages])

  function navigateToManualEditor(): Promise<boolean> {
    if (journeyId == null) return Promise.resolve(false)
    return router.push(`/journeys/${journeyId}`)
  }

  function handleConfirmLeave(): void {
    setConfirmOpen(false)
    void navigateToManualEditor()
  }

  function handleCancelLeave(): void {
    setConfirmOpen(false)
  }

  return (
    <>
      <Stack
        data-testid="AiEditorToolbar"
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          height: 48,
          px: 2,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0
        }}
      >
        <Button
          data-testid="AiEditorToolbar-editManually"
          startIcon={<ChevronLeftIcon />}
          onClick={handleEditManuallyClick}
          sx={{
            color: 'text.secondary',
            textTransform: 'none',
            fontWeight: 400,
            fontSize: 14,
            '&:hover': { bgcolor: 'transparent', opacity: 0.8 }
          }}
          aria-label={t('Edit Manually')}
          tabIndex={0}
        >
          {t('Edit Manually')}
        </Button>

        <Typography
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 14,
            fontWeight: 600,
            color: 'text.primary',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '40%'
          }}
        >
          {journeyTitle ?? ''}
        </Typography>

        <Box sx={{ minWidth: 40 }}>
          {isAiActive && (
            <IconButton
              data-testid="AiEditorToolbar-stop"
              onClick={onStopGeneration}
              aria-label={t('Stop AI generation')}
              tabIndex={0}
              sx={{
                bgcolor: 'error.main',
                color: 'white',
                borderRadius: '8px',
                width: 36,
                height: 36,
                '&:hover': { bgcolor: 'error.dark' }
              }}
            >
              <StopIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
        </Box>
      </Stack>

      <Dialog
        open={confirmOpen}
        onClose={handleCancelLeave}
        aria-labelledby="leave-ai-editor-title"
      >
        <DialogTitle id="leave-ai-editor-title">
          {t('Leave AI Editor?')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              'Your chat history will be lost if you switch to the manual editor.'
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLeave}>{t('Cancel')}</Button>
          <Button onClick={handleConfirmLeave} color="error">
            {t('Leave')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
