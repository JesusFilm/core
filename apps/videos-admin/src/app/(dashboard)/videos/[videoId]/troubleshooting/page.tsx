'use client'

import { useLazyQuery, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useParams } from 'next/navigation'
import { ReactElement } from 'react'

import { graphql } from '@core/shared/gql'

const GET_VIDEO_LANGUAGES = graphql(`
  query GetVideoLanguages($videoId: ID!) {
    adminVideo(id: $videoId) {
      id
      title {
        value
      }
      availableLanguages
    }
  }
`)

const FIX_VIDEO_LANGUAGES = graphql(`
  mutation FixVideoLanguages($videoId: ID!) {
    fixVideoLanguages(videoId: $videoId)
  }
`)

const CHECK_VIDEO_IN_ALGOLIA = graphql(`
  query CheckVideoInAlgolia($videoId: ID!) {
    checkVideoInAlgolia(videoId: $videoId) {
      ok
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

export default function TroubleshootingPage(): ReactElement {
  const { videoId } = useParams<{ videoId: string }>()
  const [getLanguages, { data, loading, error }] = useLazyQuery(
    GET_VIDEO_LANGUAGES,
    {
      variables: { videoId }
    }
  )

  const [
    fixLanguages,
    { loading: fixLoading, error: fixError, data: fixData }
  ] = useMutation(FIX_VIDEO_LANGUAGES, {
    variables: { videoId },
    refetchQueries: [
      {
        query: GET_VIDEO_LANGUAGES,
        variables: { videoId }
      }
    ]
  })

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
    {
      loading: updateVideoAlgoliaLoading,
      error: updateVideoAlgoliaError,
      data: updateVideoAlgoliaData
    }
  ] = useMutation(UPDATE_VIDEO_ALGOLIA_INDEX, {
    variables: { videoId },
    refetchQueries: [
      {
        query: CHECK_VIDEO_IN_ALGOLIA,
        variables: { videoId }
      }
    ]
  })

  const [
    updateVideoVariantsAlgolia,
    {
      loading: updateVariantsAlgoliaLoading,
      error: updateVariantsAlgoliaError,
      data: updateVariantsAlgoliaData
    }
  ] = useMutation(UPDATE_VIDEO_VARIANT_ALGOLIA_INDEX, {
    variables: { videoId },
    refetchQueries: [
      {
        query: CHECK_VIDEO_VARIANTS_IN_ALGOLIA,
        variables: { videoId }
      }
    ]
  })

  const handleFetchLanguages = (): void => {
    void getLanguages()
  }

  const handleFixLanguages = (): void => {
    void fixLanguages()
  }

  const handleCheckAlgoliaVideo = (): void => {
    void checkVideoInAlgolia()
  }

  const handleCheckAlgoliaVariants = (): void => {
    void checkVideoVariantsInAlgolia()
  }

  const handleUpdateVideoAlgolia = (): void => {
    void updateVideoAlgolia()
  }

  const handleUpdateVariantsAlgolia = (): void => {
    void updateVideoVariantsAlgolia()
  }

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Language Troubleshooting
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={handleFetchLanguages}
            disabled={loading}
          >
            Fetch Available Languages
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleFixLanguages}
            disabled={fixLoading}
          >
            Fix Available Languages
          </Button>
        </Stack>
      </Box>

      <Box>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Algolia Troubleshooting
        </Typography>
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
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={24} />
          <Typography>Loading languages...</Typography>
        </Box>
      )}

      {fixLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={24} />
          <Typography>Fixing languages...</Typography>
        </Box>
      )}

      {error != null && (
        <Box
          sx={{
            p: 2,
            bgcolor: 'error.light',
            borderRadius: 1
          }}
        >
          <Typography color="text.primary">Error: {error.message}</Typography>
        </Box>
      )}

      {fixError != null && (
        <Box
          sx={{
            p: 2,
            bgcolor: 'error.light',
            borderRadius: 1
          }}
        >
          <Typography color="text.primary">
            Fix Error: {fixError.message}
          </Typography>
        </Box>
      )}

      {fixData != null && (
        <Box
          sx={{
            p: 2,
            bgcolor: 'success.light',
            borderRadius: 1
          }}
        >
          <Typography color="success.main">
            Languages fixed successfully!
          </Typography>
        </Box>
      )}

      {algoliaVideoLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={24} />
          <Typography>Checking video in Algolia...</Typography>
        </Box>
      )}

      {algoliaVariantsLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={24} />
          <Typography>Checking variants in Algolia...</Typography>
        </Box>
      )}

      {updateVideoAlgoliaLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={24} />
          <Typography>Updating video in Algolia...</Typography>
        </Box>
      )}

      {updateVariantsAlgoliaLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={24} />
          <Typography>Updating variants in Algolia...</Typography>
        </Box>
      )}

      {algoliaVideoError != null && (
        <Box
          sx={{
            p: 2,
            bgcolor: 'error.light',
            borderRadius: 1
          }}
        >
          <Typography color="text.primary">
            Algolia Video Error: {algoliaVideoError.message}
          </Typography>
        </Box>
      )}

      {algoliaVariantsError != null && (
        <Box
          sx={{
            p: 2,
            bgcolor: 'error.light',
            borderRadius: 1
          }}
        >
          <Typography color="text.primary">
            Algolia Variants Error: {algoliaVariantsError.message}
          </Typography>
        </Box>
      )}

      {updateVideoAlgoliaError != null && (
        <Box
          sx={{
            p: 2,
            bgcolor: 'error.light',
            borderRadius: 1
          }}
        >
          <Typography color="text.primary">
            Update Video Error: {updateVideoAlgoliaError.message}
          </Typography>
        </Box>
      )}

      {updateVariantsAlgoliaError != null && (
        <Box
          sx={{
            p: 2,
            bgcolor: 'error.light',
            borderRadius: 1
          }}
        >
          <Typography color="text.primary">
            Update Variants Error: {updateVariantsAlgoliaError.message}
          </Typography>
        </Box>
      )}

      {updateVideoAlgoliaData != null && (
        <Box
          sx={{
            p: 2,
            bgcolor: 'success.light',
            borderRadius: 1
          }}
        >
          <Typography color="success.main">
            Video index updated successfully!
          </Typography>
        </Box>
      )}

      {updateVariantsAlgoliaData != null && (
        <Box
          sx={{
            p: 2,
            bgcolor: 'success.light',
            borderRadius: 1
          }}
        >
          <Typography color="success.main">
            Video variants index updated successfully!
          </Typography>
        </Box>
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
                Video in Index:
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: algoliaVideoData.checkVideoInAlgolia.ok
                    ? 'success.main'
                    : 'error.main',
                  fontWeight: 'bold'
                }}
              >
                {algoliaVideoData.checkVideoInAlgolia.ok
                  ? 'Found ✓'
                  : 'Not Found ✗'}
              </Typography>
              {(algoliaVideoData.checkVideoInAlgolia.mismatches ?? []).length >
                0 && (
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {(algoliaVideoData.checkVideoInAlgolia.mismatches ?? []).map(
                    ({ field, expected, actual }) => (
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
                    )
                  )}
                  {algoliaVideoData.checkVideoInAlgolia.recordUrl != null && (
                    <Button
                      variant="text"
                      size="small"
                      href={algoliaVideoData.checkVideoInAlgolia.recordUrl}
                      target="_blank"
                      rel="noreferrer"
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      Open in Algolia
                    </Button>
                  )}
                </Stack>
              )}
            </Box>
          </Stack>
        </Box>
      )}

      {algoliaVariantsData != null && (
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
              {(
                algoliaVariantsData.checkVideoVariantsInAlgolia
                  .missingVariants ?? []
              ).length === 0 ? (
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
                  {(
                    algoliaVariantsData.checkVideoVariantsInAlgolia
                      .missingVariants ?? []
                  ).join(', ')}
                </Typography>
              )}
              {algoliaVariantsData.checkVideoVariantsInAlgolia.browseUrl !=
                null && (
                <Button
                  variant="text"
                  size="small"
                  href={
                    algoliaVariantsData.checkVideoVariantsInAlgolia.browseUrl
                  }
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

      {data != null && (
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
              <Typography variant="body1">
                {(data.adminVideo.title as Array<{ value: string }>)[0]
                  ?.value ?? 'N/A'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Available Languages:
              </Typography>
              {((data.adminVideo.availableLanguages as string[]) ?? []).length >
              0 ? (
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {(data.adminVideo.availableLanguages as string[]).map(
                    (languageId) => (
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
                    )
                  )}
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
    </Stack>
  )
}
