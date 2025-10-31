'use client'

import { useLazyQuery, useMutation } from '@apollo/client/react'
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

export default function TroubleshootingPage(): ReactElement {
  const { videoId } = useParams<{ videoId: string }>()
  const [getLanguages, { data, loading, error }] = useLazyQuery(
    GET_VIDEO_LANGUAGES
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
    void getLanguages({ variables: { videoId } })
  }

  const handleFixLanguages = (): void => {
    void fixLanguages()
  }

  return (
    <Stack spacing={3}>
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
          <Typography color="error.main">Error: {error.message}</Typography>
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
          <Typography color="error.main">
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
