'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState, KeyboardEvent } from 'react'
import { useQuery } from '@apollo/client'
import type { VideoSummary, VideoData } from '../types/video'
import { SEARCH_VIDEOS } from '../lib/graphql'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { formatTime } from '../lib/video-utils'
import { mockVideos } from '../data/mock-videos'

interface VideoPickerProps {
  activeVideo?: VideoData | null
  onSelect: (video: VideoData) => void
}

export function VideoPicker({ activeVideo, onSelect }: VideoPickerProps) {
  const [inputValue, setInputValue] = useState('')
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('')

  // Use GraphQL query with submitted search term
  const { data, loading, error, refetch } = useQuery(SEARCH_VIDEOS, {
    variables: {
      where: submittedSearchTerm ? { title: submittedSearchTerm } : undefined,
      offset: 0,
      limit: 20,
      languageId: '529' // English language ID
    },
    skip: false, // Always run query to show default videos
    fetchPolicy: 'cache-and-network'
  })

  // Load default videos on mount if no search term
  useEffect(() => {
    if (!submittedSearchTerm.trim()) {
      // Load videos without title filter for initial display
      refetch({
        where: undefined,
        offset: 0,
        limit: 20,
        languageId: '529'
      })
    }
  }, [refetch, submittedSearchTerm])

  // Handle search submission
  const handleSearch = useCallback(() => {
    const trimmedInput = inputValue.trim()
    if (trimmedInput && trimmedInput !== submittedSearchTerm) {
      console.log('🔍 [VideoPicker] Search submitted:', {
        searchTerm: trimmedInput,
        timestamp: new Date().toISOString(),
        variables: {
          where: { title: trimmedInput },
          offset: 0,
          limit: 20,
          languageId: '529'
        }
      })
      setSubmittedSearchTerm(trimmedInput)
    }
  }, [inputValue, submittedSearchTerm])

  // Handle Enter key press
  const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSearch()
    }
  }, [handleSearch])

  // Log when loading state changes
  useEffect(() => {
    console.log('⏳ [VideoPicker] Loading state:', loading, {
      submittedSearchTerm: submittedSearchTerm.trim(),
      inputValue: inputValue.trim(),
      timestamp: new Date().toISOString()
    })
  }, [loading, submittedSearchTerm, inputValue])

  // Transform mock videos to match GraphQL structure for fallback
  const mockVideoData = useMemo(() => {
    if (data?.videos?.length) return data // Use real GraphQL data if available

    // Filter mock videos based on search term
    const filtered = mockVideos.filter(video => {
      if (!submittedSearchTerm.trim()) return true
      return video.title.toLowerCase().includes(submittedSearchTerm.toLowerCase()) ||
             video.slug.toLowerCase().includes(submittedSearchTerm.toLowerCase())
    })

    // Transform to GraphQL-like structure
    return {
      videos: filtered.map(video => ({
        slug: video.slug,
        label: video.slug,
        title: [{ value: video.title }],
        description: [{ value: video.description }],
        images: [{ mobileCinematicHigh: video.poster }],
        variant: {
          id: video.slug,
          hls: video.src, // For mock data, use the same MP4 URL as HLS (Video.js can handle this)
          duration: video.duration,
          downloadable: true,
          downloads: [{
            quality: 'high',
            size: 1000000,
            url: video.src,
            height: video.height,
            width: video.width
          }],
          language: {
            id: '529',
            bcp47: 'en',
            name: [{ value: 'English', primary: true }]
          }
        },
        availableLanguages: ['529'],
        variantLanguagesCount: 1
      }))
    }
  }, [data, submittedSearchTerm])

  // Log when data is received
  useEffect(() => {
    if (mockVideoData) {
      console.log('✅ [VideoPicker] Data available:', {
        submittedSearchTerm: submittedSearchTerm.trim(),
        inputValue: inputValue.trim(),
        videoCount: mockVideoData.videos?.length || 0,
        usingMockData: !data?.videos?.length,
        videos: mockVideoData.videos?.map(video => ({
          slug: video.slug,
          title: video.title?.[0]?.value || 'Untitled',
          label: video.label
        })),
        timestamp: new Date().toISOString()
      })
    }
  }, [mockVideoData, submittedSearchTerm, inputValue, data])

  // Log when error occurs
  useEffect(() => {
    if (error) {
      console.error('❌ [VideoPicker] Search error:', {
        submittedSearchTerm: submittedSearchTerm.trim(),
        inputValue: inputValue.trim(),
        error: error.message,
        graphQLErrors: error.graphQLErrors,
        networkError: error.networkError,
        timestamp: new Date().toISOString()
      })
    }
  }, [error, submittedSearchTerm, inputValue])

  const handleSelect = useCallback(
    (video: VideoData) => {
      onSelect(video)
    },
    [onSelect]
  )

  const activeSlug = activeVideo?.slug

  const subtitle = useMemo(() => {
    if (loading && !mockVideoData.videos?.length) {
      return 'Searching library…'
    }

    if (error && !mockVideoData.videos?.length) {
      return `Error: ${error.message}`
    }

    if (!submittedSearchTerm.trim() && !mockVideoData.videos?.length) {
      return 'Loading videos…'
    }

    const videoCount = mockVideoData.videos?.length ?? 0
    if (videoCount === 0) {
      return 'No matches found. Try a different search term.'
    }

    return `Found ${videoCount} video${videoCount === 1 ? '' : 's'}`
  }, [error, loading, submittedSearchTerm, mockVideoData.videos?.length])

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-base font-semibold text-white">Video Library</h2>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </header>

      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search videos by title..."
          aria-label="Search videos"
          className="flex-1"
        />
        <Button
          onClick={handleSearch}
          disabled={!inputValue.trim() || loading}
          variant="primary"
          size="default"
        >
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      <ul className="grid grid-cols-1 gap-3">
        {mockVideoData.videos?.map((video) => {
          const isActive = video.slug === activeSlug
          const posterUrl = video.images?.[0]?.mobileCinematicHigh || '/placeholder-video.png'
          const title = video.title?.[0]?.value || 'Untitled Video'
          const duration = video.variant?.duration || 0

          return (
            <li
              key={video.slug}
              className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3 shadow-sm"
            >
              <div className="relative h-16 w-28 overflow-hidden rounded-lg bg-slate-800">
                <Image
                  src={posterUrl}
                  alt={title}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
                <span className="absolute bottom-1 right-1 rounded bg-slate-950/70 px-1 text-[10px] font-semibold">
                  {formatTime(duration)}
                </span>
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-white">{title}</p>
                <p className="text-xs text-slate-400">slug: {video.slug}</p>
                <p className="text-xs text-slate-500">{video.label}</p>
              </div>
              <Button
                variant={isActive ? 'ghost' : 'primary'}
                size="sm"
                onClick={() => handleSelect(video)}
                disabled={loading}
              >
                {isActive ? 'Selected' : 'Load'}
              </Button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
