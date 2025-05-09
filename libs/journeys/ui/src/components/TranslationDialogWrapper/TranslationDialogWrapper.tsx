import { LoadingButton } from '@mui/lab'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, ReactNode, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

interface TranslationDialogWrapperProps {
  /**
   * Controls whether the dialog is displayed
   */
  open: boolean

  /**
   * Function to call when the dialog is closed
   */
  onClose: () => void

  /**
   * Function to call when the translation action is triggered
   * This function should handle its own error states and messaging
   */
  onTranslate: () => Promise<void>

  /**
   * Dialog title to display when not in loading state
   */
  title: string

  /**
   * Text to display during loading state
   */
  loadingText?: string

  /**
   * Test ID for the component
   */
  testId?: string

  /**
   * Children to render when not in loading state
   */
  children: ReactNode
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
  testId,
  children
}: TranslationDialogWrapperProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [loading, setLoading] = useState(false)

  const defaultLoadingText = t('Translating your journey...')

  const handleTranslate = async (): Promise<void> => {
    if (loading) return

    try {
      setLoading(true)
      await onTranslate()
    } catch (error) {
      // Error UI should be handled in the onTranslate function
      console.error('Translation operation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
                onClick={handleTranslate}
                loading={loading}
              >
                {t('Create')}
              </LoadingButton>
            </>
          ) : (
            <Button variant="outlined" color="secondary" onClick={onClose}>
              {t('Cancel')}
            </Button>
          )}
        </>
      }
      testId={testId}
    >
      {loading ? (
        <Box display="flex" flexDirection="column" alignItems="center" p={3}>
          <CircularProgress color="secondary" />
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
