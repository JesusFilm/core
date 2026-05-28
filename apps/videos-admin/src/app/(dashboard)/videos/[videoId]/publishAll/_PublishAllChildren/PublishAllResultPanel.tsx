'use client'

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import type { PublishSummaryEntry } from './publishAll.types'
import { VideoIdNewTabLink } from './VideoIdNewTabLink'

export function PublishAllResultPanel({
  latestResult
}: {
  latestResult: PublishSummaryEntry
}): ReactElement | null {
  const hasVideosOrVariants =
    latestResult.publishedVideoIds.length > 0 ||
    latestResult.publishedVariantIds.length > 0
  const hasFailures = (latestResult.videosFailedValidation?.length ?? 0) > 0

  if (!hasVideosOrVariants && !hasFailures) {
    return null
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        maxHeight: 320,
        overflow: 'auto',
        bgcolor: 'action.hover'
      }}
    >
      {hasVideosOrVariants && (
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body2" sx={{ mb: 0.75 }}>
            {latestResult.dryRun ? 'Would publish:' : 'Published:'}
          </Typography>
          {latestResult.publishedVideoIds.length > 0 && (
            <Stack spacing={1.5} sx={{ pl: 0, alignItems: 'flex-start' }}>
              {latestResult.publishedVideoIds.map((id) => (
                <VideoIdNewTabLink key={id} id={id} status="success" />
              ))}
            </Stack>
          )}
          {latestResult.publishedVariantIds.length > 0 && (
            <Box
              sx={{
                mt: latestResult.publishedVideoIds.length > 0 ? 1.25 : 0
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                Audio Languages:
              </Typography>
              <Stack spacing={0.35} sx={{ pl: 2 }}>
                {latestResult.publishedVariantIds.map((variantId) => (
                  <Stack
                    key={variantId}
                    direction="row"
                    spacing={0.75}
                    alignItems="center"
                    component="span"
                    aria-label={`Published: ${variantId}`}
                  >
                    <CheckCircleIcon
                      sx={{
                        color: 'success.main',
                        fontSize: '1.125rem',
                        flexShrink: 0
                      }}
                      aria-hidden
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      component="span"
                    >
                      {variantId}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      )}
      {hasFailures && (
        <Box
          sx={{
            mt:
              latestResult.publishedVideoIds.length > 0 ||
              latestResult.publishedVariantIds.length > 0
                ? 1.5
                : 0
          }}
        >
          <Typography variant="body2" color="warning.main" sx={{ mb: 0.75 }}>
            Could not publish:
          </Typography>
          <Stack spacing={2}>
            {latestResult.videosFailedValidation
              .filter((row) => row.videoId != null && row.videoId !== '')
              .map((row) => {
                const id = row.videoId as string
                const missing = row.missingFields ?? []
                const showMessageOnly =
                  missing.length === 0 &&
                  row.message != null &&
                  row.message !== ''
                return (
                  <Box key={id}>
                    <VideoIdNewTabLink id={id} status="error" />
                    {missing.length > 0 ? (
                      <Box sx={{ mt: 0.75, pl: 0 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          This video is missing the following:
                        </Typography>
                        <Stack spacing={0.35} sx={{ pl: 2 }}>
                          {missing.map((field) => (
                            <Typography
                              key={`${id}-${field}`}
                              variant="body2"
                              color="text.secondary"
                            >
                              {field}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    ) : null}
                    {showMessageOnly ? (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.75 }}
                      >
                        {row.message}
                      </Typography>
                    ) : null}
                  </Box>
                )
              })}
          </Stack>
        </Box>
      )}
    </Paper>
  )
}
