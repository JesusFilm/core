import { LoadingButton } from '@mui/lab'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, ReactNode } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { TranslationProgressBar } from '../TranslationProgressBar'

interface TranslationDialogWrapperProps {
  open: boolean
  onClose: () => void
  onTranslate: () => Promise<void>
  title: string
  loadingText?: string
  loading: boolean
  testId?: string
  children: ReactNode
  submitLabel?: string
  divider?: boolean
  isTranslation?: boolean
  translationProgress?: {
    progress: number
    message: string
  } | null
}

/**
 * A wrapper component that provides a consistent UI for translation dialogs
 * with loading state handling and standard buttons.
 *
 * @param {TranslationDialogWrapperProps} props - The component props
 * @returns {ReactElement} The rendered component
 */
export function TranslationDialogWrapper({
  open,
  onClose,
  onTranslate,
  title,
  loadingText,
  loading,
  testId,
  children,
  submitLabel,
  divider,
  isTranslation,
  translationProgress
}: TranslationDialogWrapperProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const defaultLoadingText = t('Translating your journey...')

  return (
    <Dialog
      open={open}
      onClose={onClose}
      divider={divider}
      dialogTitle={
        !loading
          ? {
              title
            }
          : {
              title: loadingText ?? defaultLoadingText
            }
      }
      dialogActionChildren={
        <>
          {!loading && (
            <>
              <Button
                variant="outlined"
                color="secondary"
                onClick={onClose}
                disabled={loading}
                sx={{ mr: 3 }}
              >
                {t('Cancel')}
              </Button>
              <LoadingButton
                variant="contained"
                onClick={onTranslate}
                loading={loading}
                sx={{
                  backgroundColor: 'secondary.dark'
                }}
              >
                {submitLabel ?? t('Create')}
              </LoadingButton>
            </>
          )}
        </>
      }
      testId={testId}
    >
      {loading && isTranslation ? (
        <Box display="flex" flexDirection="column" alignItems="center" p={3}>
          {translationProgress ? (
            <>
              <TranslationProgressBar
                progress={translationProgress.progress}
                message={translationProgress.message}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2, fontStyle: 'italic' }}
              >
                {t('Please keep this window open during translation')}
              </Typography>
            </>
          ) : (
            <>
              <CircularProgress color="primary" />
              <Typography variant="body1" mt={2}>
                {t('Preparing translation...')}
              </Typography>
            </>
          )}
        </Box>
      ) : (
        children
      )}
    </Dialog>
  )
}
