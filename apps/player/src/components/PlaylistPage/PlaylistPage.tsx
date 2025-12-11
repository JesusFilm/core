'use client'

import { ReactElement, useState } from 'react'

import { TopNavBar } from '@/components/TopNavBar'
import { VideoMetadata } from '@/components/VideoMetadata'
import { VideoPlayer } from '@/components/VideoPlayer'
import { PlaylistList } from '@/components/PlaylistList'

interface PlaylistItem {
  id: string
  order: number | null
  videoVariant: {
    id: string
    hls: string | null
    duration: number
    language: {
      id: string
      name: {
        value: string
      }[]
    }
    video: {
      id: string
      title: {
        value: string
      }[]
      description: {
        value: string
        primary: boolean
      }[]
      studyQuestions: {
        value: string
        primary: boolean
      }[]
      images: {
        mobileCinematicHigh: string | null
      }[]
    } | null
  }
}

interface Playlist {
  id: string
  name: string
  items: PlaylistItem[]
}

interface PlaylistPageProps {
  playlist: Playlist
}

export function PlaylistPage({ playlist }: PlaylistPageProps): ReactElement {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0)

  const activeItem = playlist.items[activeVideoIndex]
  const activeVideoVariant = activeItem?.videoVariant

  if (!activeVideoVariant?.hls) {
    return (
      <div className="flex min-h-screen flex-col">
        <TopNavBar />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold">{playlist.name}</h1>
            <p className="text-text-secondary">No video available</p>
          </div>
        </div>
      </div>
    )
  }

  const handleVideoEnd = () => {
    if (activeVideoIndex < playlist.items.length - 1) {
      setActiveVideoIndex(activeVideoIndex + 1)
    }
  }

  const handleVideoSelect = (index: number) => {
    setActiveVideoIndex(index)
  }

  const activeVideo = activeVideoVariant.video

  return (
    <div className="flex min-h-screen flex-col">
      <TopNavBar />
      <div className="grid grid-cols-1 gap-1 px-4 lg:grid-cols-[1fr_400px] lg:px-8">
        <div className="lg:pr-2">
          <div className="-mx-4 mb-2 aspect-video overflow-hidden bg-black lg:mx-0 lg:mb-0 lg:rounded-xl">
            <VideoPlayer
              hlsUrl={activeVideoVariant.hls}
              videoTitle={activeVideo?.title?.[0]?.value ?? ''}
              thumbnail={activeVideo?.images?.[0]?.mobileCinematicHigh ?? null}
              onVideoEnd={handleVideoEnd}
            />
          </div>
        </div>
        <div className="flex w-full pt-2 lg:w-auto lg:max-w-[400px] lg:pt-0">
          <div className="flex aspect-video w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex-shrink-0 p-4 pb-2">
              <h1 className="mb-1 text-lg font-semibold text-gray-900">
                {playlist.name}
              </h1>
            </div>
            <div className="flex-1 overflow-y-auto">
              <PlaylistList
                items={playlist.items}
                activeIndex={activeVideoIndex}
                onVideoSelect={handleVideoSelect}
              />
            </div>
          </div>
        </div>
        {activeVideo && (
          <div className="pt-2 lg:pr-2">
            <VideoMetadata
              title={activeVideo.title?.[0]?.value ?? ''}
              description={activeVideo.description ?? []}
              studyQuestions={activeVideo.studyQuestions ?? []}
            />
          </div>
        )}
        <div className="w-full max-w-[400px] pt-2 lg:w-auto" />
      </div>
    </div>
  )
}
