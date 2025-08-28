'use client'

import { useLazyQuery } from '@apollo/client'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { ReactElement, useEffect, useRef, useState } from 'react'

import { graphql } from '@core/shared/gql'

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

/**
 * Prepares a search term to improve match quality
 * This normalizes spaces and adds wildcards for partial matching
 */
function prepareSearchTerm(term: string): string {
  // Normalize consecutive spaces
  const normalized = term.trim().replace(/\s+/g, ' ')

  // For very short terms (1-2 chars), use as is
  if (normalized.length <= 2) {
    return normalized
  }

  // For longer terms, we want to support partial matching
  // Split words and prepare each independently
  const words = normalized.split(' ')

  // If it's just one short word, return as is
  if (words.length === 1 && words[0].length <= 3) {
    return words[0]
  }

  // For multiple words or longer words, prepare search
  if (words.length > 1) {
    // If multiple words, each word should be searchable independently
    return words.map((word) => word).join(' ')
  }

  // For a single longer word
  return normalized
}

const filter = createFilterOptions<VideoOption>()

export function ExistingVideoSelector({
  onSelect,
  onCancel
}: ExistingVideoSelectorProps): ReactElement {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVideo, setSelectedVideo] = useState<VideoOption | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [searchVideos, { loading, data }] = useLazyQuery(SEARCH_VIDEOS)

  // Debounce search to avoid too many requests and improve search quality
  const handleInputChange = (
    _event: React.SyntheticEvent,
    value: string
  ): void => {
    setSearchTerm(value)

    // Clear the previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      if (value.length >= 2) {
        const searchValue = prepareSearchTerm(value)
        void searchVideos({ variables: { title: searchValue } })
      }
    }, 300) // Debounce for 300ms
  }

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

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

  // Handle selection of a video option or input that's not in the options list
  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: VideoOption | null
  ): void => {
    if (newValue === null) {
      setSelectedVideo(null)
      return
    }

    setSelectedVideo(newValue)
  }

  // Process titles to make matching more visible
  const options: VideoOption[] =
    data?.adminVideos.map((video) => ({
      id: video.id,
      title: video.title.find((t) => t.primary)?.value || 'Untitled'
    })) || []

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Autocomplete<VideoOption, false, false, false>
        fullWidth
        options={options}
        loading={loading}
        onInputChange={handleInputChange}
        onChange={handleChange}
        getOptionLabel={(option: VideoOption) => option.title}
        isOptionEqualToValue={(option: VideoOption, value: VideoOption) =>
          option.id === value.id
        }
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
        renderOption={(props, option: VideoOption) => (
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
            : loading
              ? 'Searching...'
              : 'No videos found'
        }
        filterOptions={(options, params) => {
          const filtered = filter(options, params)
          return filtered
        }}
        value={selectedVideo}
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
