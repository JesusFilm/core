import { LoadingButton } from '@mui/lab'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, ReactNode } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

interface TranslationDialogWrapperProps {
  open: boolean
  onClose: () => void
  onTranslate: () => Promise<void>
  title: string
  loadingText?: string
  loading: boolean
  testId?: string
  children: ReactNode
  divider?: boolean
}

/**
 * A wrapper component that provides a consistent UI for translation dialogs
 * with loading state handling and standard buttons.
 *
 * @param open Controls whether the dialog is displayed
 * @param onClose Function to call when the dialog is closed
 * @param onTranslate Function to call when the translation action is triggered
 * @param title Dialog title to display when not in loading state
 * @param loadingText Text to display during loading state
 * @param loading Whether the component is in loading state
 * @param testId Test ID for the component
 * @param children Children to render when not in loading state
 * @param divider Whether to show dividers in the dialog
 * @returns The rendered dialog component
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
  divider
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
              title,
              closeButton: true
            }
          : undefined
      }
      dialogActionChildren={
        <>
          {!loading ? (
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
                color="secondary"
                onClick={onTranslate}
                loading={loading}
              >
                {t('Create')}
              </LoadingButton>
            </>
          ) : (
            <Box display="flex" justifyContent="center" width="100%">
              <Button variant="outlined" color="secondary" onClick={onClose}>
                {t('Cancel')}
              </Button>
            </Box>
          )}
        </>
      }
      testId={testId}
    >
      {loading ? (
        <Box display="flex" flexDirection="column" alignItems="center" p={3}>
          <CircularProgress color="primary" />
          <Typography variant="body1" mt={2}>
            {loadingText ?? defaultLoadingText}
          </Typography>
        </Box>
      ) : (
        children
      )}
    </Dialog>
  )
}
