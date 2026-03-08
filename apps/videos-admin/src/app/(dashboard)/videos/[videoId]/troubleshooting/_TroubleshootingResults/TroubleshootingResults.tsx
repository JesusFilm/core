'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

export type CheckVideoInAlgoliaMismatch = {
  field: string
  expected: string | null
  actual: string | null
}

export type CheckVideoInAlgoliaResult = {
  ok: boolean
  error: string | null
  mismatches: CheckVideoInAlgoliaMismatch[]
  recordUrl: string | null
}

export type CheckVideoVariantsInAlgoliaResult = {
  ok: boolean
  missingVariants: string[]
  browseUrl: string | null
}

interface TroubleshootingResultsProps {
  showAlgoliaVideoStatus: boolean
  algoliaVideoResult: CheckVideoInAlgoliaResult | null
  showAlgoliaVariantsStatus: boolean
  algoliaVariantsResult: CheckVideoVariantsInAlgoliaResult | null
  showVideoInformation: boolean
  videoTitle: string
  availableLanguages: string[]
}

export function TroubleshootingResults({
  showAlgoliaVideoStatus,
  algoliaVideoResult,
  showAlgoliaVariantsStatus,
  algoliaVariantsResult,
  showVideoInformation,
  videoTitle,
  availableLanguages
}: TroubleshootingResultsProps): ReactElement {
  const algoliaVideoMismatches = algoliaVideoResult?.mismatches ?? []
  const algoliaVideoLookupError = algoliaVideoResult?.error ?? null
  const hasAlgoliaVideoLookupError =
    algoliaVideoLookupError != null && algoliaVideoLookupError !== ''
  const hasAlgoliaVideoMismatches = algoliaVideoMismatches.length > 0
  const isAlgoliaVideoOk = algoliaVideoResult?.ok === true

  const algoliaVideoStatusText = hasAlgoliaVideoLookupError
    ? 'Lookup Failed ✗'
    : isAlgoliaVideoOk
      ? 'OK ✓'
      : hasAlgoliaVideoMismatches
        ? 'Mismatch ✗'
        : 'Not Found ✗'

  const algoliaVideoStatusColor = hasAlgoliaVideoLookupError
    ? 'error.main'
    : isAlgoliaVideoOk
      ? 'success.main'
      : 'error.main'

  return (
    <>
      {showAlgoliaVideoStatus && (
        <Box
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h6">Algolia Video Status</Typography>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Video record:
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: algoliaVideoStatusColor,
                  fontWeight: 'bold'
                }}
              >
                {algoliaVideoStatusText}
              </Typography>
              {hasAlgoliaVideoLookupError && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.primary">
                    Algolia error: {algoliaVideoLookupError}
                  </Typography>
                </Box>
              )}

              {hasAlgoliaVideoMismatches && (
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {algoliaVideoMismatches.map(({ field, expected, actual }) => (
                    <Typography
                      key={field}
                      variant="body2"
                      sx={{
                        px: 2,
                        py: 1,
                        bgcolor: 'warning.light',
                        borderRadius: 1,
                        fontFamily: 'monospace'
                      }}
                    >
                      {field}: expected {expected ?? 'null'}, got {actual ?? 'null'}
                    </Typography>
                  ))}
                </Stack>
              )}

              {algoliaVideoResult?.recordUrl != null && (
                <Button
                  variant="text"
                  size="small"
                  href={algoliaVideoResult.recordUrl}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ mt: 1, alignSelf: 'flex-start' }}
                >
                  Open in Algolia
                </Button>
              )}
            </Box>
          </Stack>
        </Box>
      )}

      {showAlgoliaVariantsStatus && algoliaVariantsResult != null && (
        <Box
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h6">Algolia Video Variants Status</Typography>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Variants in Index:
              </Typography>
              {algoliaVariantsResult.missingVariants.length === 0 ? (
                <Typography
                  variant="body1"
                  sx={{
                    px: 2,
                    py: 1,
                    bgcolor: 'success.light',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    color: 'success.main',
                    mt: 1
                  }}
                >
                  All variants found ✓
                </Typography>
              ) : (
                <Typography variant="body1" color="error.main">
                  Missing variants: {algoliaVariantsResult.missingVariants.join(', ')}
                </Typography>
              )}
              {algoliaVariantsResult.browseUrl != null && (
                <Button
                  variant="text"
                  size="small"
                  href={algoliaVariantsResult.browseUrl}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ mt: 1, alignSelf: 'flex-start' }}
                >
                  Open variants in Algolia
                </Button>
              )}
            </Box>
          </Stack>
        </Box>
      )}

      {showVideoInformation && (
        <Box
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h6">Video Information</Typography>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Title:
              </Typography>
              <Typography variant="body1">{videoTitle}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Available Languages:
              </Typography>
              {availableLanguages.length > 0 ? (
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {availableLanguages.map((languageId) => (
                    <Typography
                      key={languageId}
                      variant="body1"
                      sx={{
                        px: 2,
                        py: 1,
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                        fontFamily: 'monospace'
                      }}
                    >
                      {languageId}
                    </Typography>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No languages available
                </Typography>
              )}
            </Box>
          </Stack>
        </Box>
      )}
    </>
  )
}
