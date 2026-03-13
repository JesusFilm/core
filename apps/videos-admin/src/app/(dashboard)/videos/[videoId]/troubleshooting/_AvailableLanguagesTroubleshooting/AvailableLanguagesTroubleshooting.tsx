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

export function AvailableLanguagesTroubleshooting(): ReactElement {
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

  const handleFetchLanguages = (): void => {
    void getLanguages()
  }

  const handleFixLanguages = (): void => {
    void fixLanguages()
  }

  const videoTitle =
    (data?.adminVideo.title as Array<{ value: string }> | undefined)?.[0]
      ?.value ?? 'N/A'
  const availableLanguages =
    (data?.adminVideo.availableLanguages as string[] | undefined) ?? []

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Available Languages</Typography>

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

      {loading && <LoadingRow message="Loading languages..." />}
      {fixLoading && <LoadingRow message="Fixing languages..." />}
      {error?.message != null && (
        <Alert message={`Error: ${error.message}`} variant="error" />
      )}
      {fixError?.message != null && (
        <Alert message={`Fix Error: ${fixError.message}`} variant="error" />
      )}
      {fixData != null && (
        <Alert message="Languages fixed successfully!" variant="success" />
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
    </Stack>
  )
}
