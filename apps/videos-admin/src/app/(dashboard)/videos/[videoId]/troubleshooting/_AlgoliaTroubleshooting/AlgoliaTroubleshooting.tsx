'use client'

import { useLazyQuery, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useParams } from 'next/navigation'
import { ReactElement, useState } from 'react'

import { graphql } from '@core/shared/gql'

type CheckVideoInAlgoliaMismatch = {
  field: string
  expected: string | null
  actual: string | null
}

type CheckVideoInAlgoliaResult = {
  ok: boolean
  error: string | null
  mismatches: CheckVideoInAlgoliaMismatch[]
  recordUrl: string | null
}

type CheckVideoVariantsInAlgoliaResult = {
  ok: boolean
  missingVariants: string[]
  browseUrl: string | null
}

const CHECK_VIDEO_IN_ALGOLIA = graphql(`
  query CheckVideoInAlgolia($videoId: ID!) {
    checkVideoInAlgolia(videoId: $videoId) {
      ok
      error
      mismatches {
        field
        expected
        actual
      }
      recordUrl
    }
  }
`)

const CHECK_VIDEO_VARIANTS_IN_ALGOLIA = graphql(`
  query CheckVideoVariantsInAlgolia($videoId: ID!) {
    checkVideoVariantsInAlgolia(videoId: $videoId) {
      ok
      missingVariants
      browseUrl
    }
  }
`)

const UPDATE_VIDEO_ALGOLIA_INDEX = graphql(`
  mutation UpdateVideoAlgoliaIndex($videoId: ID!) {
    updateVideoAlgoliaIndex(videoId: $videoId)
  }
`)

const UPDATE_VIDEO_VARIANT_ALGOLIA_INDEX = graphql(`
  mutation UpdateVideoVariantAlgoliaIndex($videoId: ID!) {
    updateVideoVariantAlgoliaIndex(videoId: $videoId)
  }
`)

function LoadingRow({ message }: { message: string }): ReactElement {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <CircularProgress size={24} />
      <Typography>{message}</Typography>
    </Box>
  )
}

function Alert({
  message,
  variant
}: {
  message: string
  variant: 'error' | 'success'
}): ReactElement {
  const backgroundColor = variant === 'error' ? 'error.light' : 'success.light'
  const textColor = variant === 'error' ? 'text.primary' : 'success.main'

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: backgroundColor,
        borderRadius: 1
      }}
    >
      <Typography color={textColor}>{message}</Typography>
    </Box>
  )
}

export function AlgoliaTroubleshooting(): ReactElement {
  const { videoId } = useParams<{ videoId: string }>()
  const [lastUpdateVideoAlgoliaSucceeded, setLastUpdateVideoAlgoliaSucceeded] =
    useState<boolean | null>(null)
  const [
    lastUpdateVariantsAlgoliaSucceeded,
    setLastUpdateVariantsAlgoliaSucceeded
  ] = useState<boolean | null>(null)

  const [
    checkVideoInAlgolia,
    {
      data: algoliaVideoData,
      loading: algoliaVideoLoading,
      error: algoliaVideoError
    }
  ] = useLazyQuery(CHECK_VIDEO_IN_ALGOLIA, {
    variables: { videoId }
  })

  const [
    checkVideoVariantsInAlgolia,
    {
      data: algoliaVariantsData,
      loading: algoliaVariantsLoading,
      error: algoliaVariantsError
    }
  ] = useLazyQuery(CHECK_VIDEO_VARIANTS_IN_ALGOLIA, {
    variables: { videoId }
  })

  const [
    updateVideoAlgolia,
    { loading: updateVideoAlgoliaLoading, error: updateVideoAlgoliaError }
  ] = useMutation(UPDATE_VIDEO_ALGOLIA_INDEX, {
    variables: { videoId },
    onCompleted: () => {
      setLastUpdateVideoAlgoliaSucceeded(true)
    },
    onError: () => {
      setLastUpdateVideoAlgoliaSucceeded(false)
    },
    refetchQueries: [
      {
        query: CHECK_VIDEO_IN_ALGOLIA,
        variables: { videoId }
      }
    ]
  })

  const [
    updateVideoVariantsAlgolia,
    { loading: updateVariantsAlgoliaLoading, error: updateVariantsAlgoliaError }
  ] = useMutation(UPDATE_VIDEO_VARIANT_ALGOLIA_INDEX, {
    variables: { videoId },
    onCompleted: () => {
      setLastUpdateVariantsAlgoliaSucceeded(true)
    },
    onError: () => {
      setLastUpdateVariantsAlgoliaSucceeded(false)
    },
    refetchQueries: [
      {
        query: CHECK_VIDEO_VARIANTS_IN_ALGOLIA,
        variables: { videoId }
      }
    ]
  })

  const handleCheckAlgoliaVideo = (): void => {
    void checkVideoInAlgolia()
  }

  const handleCheckAlgoliaVariants = (): void => {
    void checkVideoVariantsInAlgolia()
  }

  const handleUpdateVideoAlgolia = (): void => {
    setLastUpdateVideoAlgoliaSucceeded(null)
    void updateVideoAlgolia()
  }

  const handleUpdateVariantsAlgolia = (): void => {
    setLastUpdateVariantsAlgoliaSucceeded(null)
    void updateVideoVariantsAlgolia()
  }

  const algoliaVideoResult = (algoliaVideoData?.checkVideoInAlgolia ??
    null) as unknown as CheckVideoInAlgoliaResult | null
  const algoliaVariantsResult =
    (algoliaVariantsData?.checkVideoVariantsInAlgolia ??
      null) as unknown as CheckVideoVariantsInAlgoliaResult | null
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
    <Stack spacing={2}>
      <Typography variant="h5">Algolia</Typography>

      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={handleCheckAlgoliaVideo}
            disabled={algoliaVideoLoading}
          >
            Check Video in Algolia
          </Button>
          <Button
            variant="contained"
            onClick={handleCheckAlgoliaVariants}
            disabled={algoliaVariantsLoading}
          >
            Check Variants in Algolia
          </Button>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleUpdateVideoAlgolia}
            disabled={updateVideoAlgoliaLoading}
          >
            Update Video Index
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleUpdateVariantsAlgolia}
            disabled={updateVariantsAlgoliaLoading}
          >
            Update Variants Index
          </Button>
        </Stack>
      </Stack>

      {algoliaVideoLoading && (
        <LoadingRow message="Checking video in Algolia..." />
      )}
      {algoliaVariantsLoading && (
        <LoadingRow message="Checking variants in Algolia..." />
      )}
      {updateVideoAlgoliaLoading && (
        <LoadingRow message="Updating video in Algolia..." />
      )}
      {updateVariantsAlgoliaLoading && (
        <LoadingRow message="Updating variants in Algolia..." />
      )}

      {algoliaVideoError?.message != null && (
        <Alert
          message={`Algolia Video Error: ${algoliaVideoError.message}`}
          variant="error"
        />
      )}
      {algoliaVariantsError?.message != null && (
        <Alert
          message={`Algolia Variants Error: ${algoliaVariantsError.message}`}
          variant="error"
        />
      )}
      {updateVideoAlgoliaError?.message != null && (
        <Alert
          message={`Update Video Error: ${updateVideoAlgoliaError.message}`}
          variant="error"
        />
      )}
      {updateVariantsAlgoliaError?.message != null && (
        <Alert
          message={`Update Variants Error: ${updateVariantsAlgoliaError.message}`}
          variant="error"
        />
      )}

      {lastUpdateVideoAlgoliaSucceeded === true &&
        updateVideoAlgoliaError == null && (
          <Alert
            message="Video index updated successfully!"
            variant="success"
          />
        )}
      {lastUpdateVariantsAlgoliaSucceeded === true &&
        updateVariantsAlgoliaError == null && (
          <Alert
            message="Video variants index updated successfully!"
            variant="success"
          />
        )}

      {algoliaVideoData != null && (
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
                      {field}: expected {expected ?? 'null'}, got{' '}
                      {actual ?? 'null'}
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

      {algoliaVariantsData != null && algoliaVariantsResult != null && (
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
                  Missing variants:{' '}
                  {algoliaVariantsResult.missingVariants.join(', ')}
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
    </Stack>
  )
}
