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
  onTranslateWithAi?: () => Promise<void>
  hasAiButton?: boolean
  title: string
  loadingText?: string
  loading: boolean
  testId?: string
  children: ReactNode
  submitLabel?: string
  divider?: boolean
  isTranslation?: boolean
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
 * @returns {ReactElement} A dialog component with standardized translation UI elements
 */
export function TranslationDialogWrapper({
  open,
  onClose,
  onTranslate,
  onTranslateWithAi,
  hasAiButton,
  title,
  loadingText,
  loading,
  testId,
  children,
  submitLabel,
  divider,
  isTranslation
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
              {hasAiButton && (
                <Button
                  name="createWithAi"
                  color="secondary"
                  onClick={async () => {
                    if (onTranslateWithAi) {
                      await onTranslateWithAi()
                    }
                  }}
                  variant="outlined"
                  disabled={loading}
                  sx={{ mr: 3 }}
                >
                  {t('Create with AI')}
                </Button>
              )}
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
