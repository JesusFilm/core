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
  }
}

/**
 * TranslationDialogWrapper provides a consistent dialog interface for translation-related operations.
 *
 * This component:
 * - Renders a modal dialog with customizable header and content
 * - Handles loading states with progress indicator and custom loading text
 * - Provides standard action buttons (Cancel and Submit)
 * - Supports both translation and non-translation modes
 * - Manages dialog visibility and close actions
 *
 * @param {Object} props - The component props
 * @param {boolean} props.open - Controls the visibility of the dialog
 * @param {() => void} props.onClose - Callback function invoked when the dialog should close
 * @param {() => Promise<void>} props.onTranslate - Async callback function triggered when the submit button is clicked
 * @param {string} props.title - The title to display in the dialog header
 * @param {string} [props.loadingText] - Optional custom text to display during loading state
 * @param {boolean} props.loading - Flag indicating whether the dialog is in a loading state
 * @param {string} [props.testId] - Optional test ID for testing purposes
 * @param {ReactNode} props.children - The content to render within the dialog
 * @param {string} [props.submitLabel] - Optional custom label for the submit button (defaults to "Create")
 * @param {boolean} [props.divider] - Optional flag to show a divider between header and content
 * @param {boolean} [props.isTranslation] - Optional flag to indicate if this is a translation operation
 * @param {object} [props.translationProgress] - Optional object containing translation progress and message
 * @returns {ReactElement} A dialog component with standardized translation UI elements
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
          : undefined
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
              <Button
                variant="contained"
                onClick={onTranslate}
                loading={loading}
                sx={{
                  backgroundColor: 'secondary.dark'
                }}
              >
                {submitLabel ?? t('Create')}
              </Button>
            </>
          )}
        </>
      }
      testId={testId}
    >
      {loading && isTranslation ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          sx={{
            py: 6,
            px: 4,
            minHeight: 200
          }}
        >
          {translationProgress ? (
            <Box sx={{ width: '100%', maxWidth: 500 }}>
              <TranslationProgressBar
                progress={translationProgress.progress}
                message={translationProgress.message}
              />
            </Box>
          ) : (
            <>
              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  color: 'text.primary',
                  fontWeight: 500
                }}
              >
                {loadingText ?? defaultLoadingText}
              </Typography>
              <CircularProgress color="primary" />
            </>
          )}
        </Box>
      ) : (
        children
      )}
    </Dialog>
  )
}
