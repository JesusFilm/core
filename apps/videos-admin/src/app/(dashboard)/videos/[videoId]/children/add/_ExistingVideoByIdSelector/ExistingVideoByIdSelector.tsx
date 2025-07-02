'use client'

import { useLazyQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { graphql } from 'gql.tada'
import { ReactElement, useState } from 'react'

const GET_VIDEO_BY_ID = graphql(`
  query GetVideoById($id: ID!) {
    adminVideo(id: $id) {
      id
      title {
        primary
        value
      }
    }
  }
`)

export interface ExistingVideoByIdSelectorProps {
  onSelect: (videoId: string) => Promise<void>
  onCancel?: () => void
}

export function ExistingVideoByIdSelector({
  onSelect,
  onCancel
}: ExistingVideoByIdSelectorProps): ReactElement {
  const [videoId, setVideoId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fetchVideo, { loading, data }] = useLazyQuery(GET_VIDEO_BY_ID, {
    onError: () => {
      setError('Video not found. Please check the ID and try again.')
    }
  })

  const handleSubmit = async (): Promise<void> => {
    if (!videoId.trim()) {
      setError('Please enter a video ID')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const result = await fetchVideo({ variables: { id: videoId.trim() } })

      if (result.data?.adminVideo) {
        void onSelect(videoId.trim())
      }
    } catch (err) {
      // Error is handled in the onError callback of the query
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = (): void => {
    if (onCancel) {
      onCancel()
    }
  }

  const videoTitle = data?.adminVideo?.title.find((t) => t.primary)?.value

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <TextField
        fullWidth
        label="Video ID"
        value={videoId}
        onChange={(e) => {
          setVideoId(e.target.value)
          setError(null)
        }}
        error={!!error}
        helperText={error}
        disabled={isSubmitting || loading}
      />

      {data?.adminVideo && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle1">Video found:</Typography>
          <Typography variant="body1">{videoTitle || 'Untitled'}</Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {data.adminVideo.id}
          </Typography>
        </Box>
      )}

      <Stack direction="row" sx={{ gap: 1, mt: 2 }}>
        <Button
          variant="outlined"
          onClick={handleCancel}
          disabled={isSubmitting}
          sx={{ flex: 1 }}
        >
          <Typography>Cancel</Typography>
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!videoId.trim() || isSubmitting || loading}
          sx={{ flex: 1 }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <Typography>Save</Typography>
          )}
        </Button>
      </Stack>
    </Stack>
  )
}
