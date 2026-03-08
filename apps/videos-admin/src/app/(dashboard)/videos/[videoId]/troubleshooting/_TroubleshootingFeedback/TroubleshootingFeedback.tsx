'use client'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

interface TroubleshootingFeedbackProps {
  loadingLanguages: boolean
  fixingLanguages: boolean
  checkingAlgoliaVideo: boolean
  checkingAlgoliaVariants: boolean
  updatingAlgoliaVideo: boolean
  updatingAlgoliaVariants: boolean
  languagesErrorMessage?: string
  fixLanguagesErrorMessage?: string
  algoliaVideoErrorMessage?: string
  algoliaVariantsErrorMessage?: string
  updateVideoErrorMessage?: string
  updateVariantsErrorMessage?: string
  showFixSuccess: boolean
  showUpdateVideoSuccess: boolean
  showUpdateVariantsSuccess: boolean
}

function LoadingRow({ message }: { message: string }): ReactElement {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <CircularProgress size={24} />
      <Typography>{message}</Typography>
    </Box>
  )
}

function ErrorAlert({ message }: { message: string }): ReactElement {
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: 'error.light',
        borderRadius: 1
      }}
    >
      <Typography color="text.primary">{message}</Typography>
    </Box>
  )
}

function SuccessAlert({ message }: { message: string }): ReactElement {
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: 'success.light',
        borderRadius: 1
      }}
    >
      <Typography color="success.main">{message}</Typography>
    </Box>
  )
}

export function TroubleshootingFeedback({
  loadingLanguages,
  fixingLanguages,
  checkingAlgoliaVideo,
  checkingAlgoliaVariants,
  updatingAlgoliaVideo,
  updatingAlgoliaVariants,
  languagesErrorMessage,
  fixLanguagesErrorMessage,
  algoliaVideoErrorMessage,
  algoliaVariantsErrorMessage,
  updateVideoErrorMessage,
  updateVariantsErrorMessage,
  showFixSuccess,
  showUpdateVideoSuccess,
  showUpdateVariantsSuccess
}: TroubleshootingFeedbackProps): ReactElement {
  return (
    <>
      {loadingLanguages && <LoadingRow message="Loading languages..." />}
      {fixingLanguages && <LoadingRow message="Fixing languages..." />}
      {checkingAlgoliaVideo && (
        <LoadingRow message="Checking video in Algolia..." />
      )}
      {checkingAlgoliaVariants && (
        <LoadingRow message="Checking variants in Algolia..." />
      )}
      {updatingAlgoliaVideo && <LoadingRow message="Updating video in Algolia..." />}
      {updatingAlgoliaVariants && (
        <LoadingRow message="Updating variants in Algolia..." />
      )}

      {languagesErrorMessage != null && (
        <ErrorAlert message={`Error: ${languagesErrorMessage}`} />
      )}
      {fixLanguagesErrorMessage != null && (
        <ErrorAlert message={`Fix Error: ${fixLanguagesErrorMessage}`} />
      )}
      {algoliaVideoErrorMessage != null && (
        <ErrorAlert message={`Algolia Video Error: ${algoliaVideoErrorMessage}`} />
      )}
      {algoliaVariantsErrorMessage != null && (
        <ErrorAlert
          message={`Algolia Variants Error: ${algoliaVariantsErrorMessage}`}
        />
      )}
      {updateVideoErrorMessage != null && (
        <ErrorAlert message={`Update Video Error: ${updateVideoErrorMessage}`} />
      )}
      {updateVariantsErrorMessage != null && (
        <ErrorAlert message={`Update Variants Error: ${updateVariantsErrorMessage}`} />
      )}

      {showFixSuccess && (
        <SuccessAlert message="Languages fixed successfully!" />
      )}
      {showUpdateVideoSuccess && (
        <SuccessAlert message="Video index updated successfully!" />
      )}
      {showUpdateVariantsSuccess && (
        <SuccessAlert message="Video variants index updated successfully!" />
      )}
    </>
  )
}
