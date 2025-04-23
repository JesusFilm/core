'use client'

import { useLazyQuery } from '@apollo/client'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { graphql } from 'gql.tada'
import { useState } from 'react'

const SEARCH_VIDEOS = graphql(`
  query SearchVideos($title: String!) {
    adminVideos(where: { title: $title }, limit: 20) {
      id
      title {
        primary
        value
      }
    }
  }
`)

export interface ExistingVideoSelectorProps {
  onSelect: (videoId: string) => Promise<void>
  onCancel?: () => void
}

interface VideoOption {
  id: string
  title: string
}

export function ExistingVideoSelector({
  onSelect,
  onCancel
}: ExistingVideoSelectorProps): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVideo, setSelectedVideo] = useState<VideoOption | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [searchVideos, { loading, data }] = useLazyQuery(SEARCH_VIDEOS)

  const handleInputChange = (
    _event: React.SyntheticEvent,
    value: string
  ): void => {
    setSearchTerm(value)
    if (value.length >= 2) {
      void searchVideos({ variables: { title: value } })
    }
  }

  const handleSubmit = async (): Promise<void> => {
    if (selectedVideo) {
      setIsSubmitting(true)
      try {
        await onSelect(selectedVideo.id)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleCancel = (): void => {
    if (onCancel) {
      onCancel()
    }
  }

  const options: VideoOption[] =
    data?.adminVideos.map((video) => ({
      id: video.id,
      title: video.title.find((t) => t.primary)?.value || 'Untitled'
    })) || []

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Autocomplete
        fullWidth
        options={options}
        loading={loading}
        onInputChange={handleInputChange}
        onChange={(_event, newValue) => setSelectedVideo(newValue)}
        getOptionLabel={(option) => option.title}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search videos by title"
            fullWidth
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            <Typography variant="body1">{option.title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              ({option.id})
            </Typography>
          </Box>
        )}
        noOptionsText={
          searchTerm.length < 2
            ? 'Type at least 2 characters to search'
            : 'No videos found'
        }
      />
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
          disabled={!selectedVideo || isSubmitting}
          sx={{ flex: 1 }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <Typography>Save</Typography>
          )}
        </Button>
      </Stack>
    </Stack>
  )
}
