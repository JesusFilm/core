'use client'

import { useState, type ReactElement } from 'react'

import { Video } from '../Video'

interface Video {
  title: { value: string; primary: boolean }[]
  images: { thumbnail: string | null }[]
}

interface VideoPlaylistItem {
  id: string
  videoVariant: {
    hls: string | null
    video: Video | null
    duration: number
  }
}

interface VideoPlaylistProps {
  playlist: {
    name: string
    id: string
    items: VideoPlaylistItem[]
  }
}

function VideoPlaylist({ playlist }: VideoPlaylistProps): ReactElement {
  const [currentItem, setCurrentItem] = useState<VideoPlaylistItem | null>(
    () => playlist.items[0] ?? null
  )

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex h-full">
      {/* Video Player - 16:9 aspect ratio */}
      <div className="aspect-video flex-1">
        {currentItem && (
          <Video
            key={currentItem.id}
            videoVariant={currentItem.videoVariant}
            onEnded={() => {
              console.log('ended')
            }}
            autoplay
          />
        )}
      </div>

      {/* Playlist Sidebar */}
      <div className="w-[300px] flex flex-col">
        {/* Title pinned to top */}
        <h1 className="text-xl font-bold px-4 py-3 text-gray-900 dark:text-gray-100 leading-relaxed border-b border-gray-200 dark:border-gray-700 truncate">
          {playlist.name}
        </h1>

        {/* Scrollable playlist */}
        <div className="flex-1 overflow-y-auto">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {playlist.items.map((item) => {
              const videoTitle =
                item.videoVariant.video?.title.find((title) => title.primary)
                  ?.value || 'Untitled'
              const thumbnail = item.videoVariant.video?.images?.find(
                (image) => image.thumbnail != null
              )?.thumbnail
              const duration = item.videoVariant.duration
              0
              const isActive = currentItem?.id === item.id

              return (
                <li key={item.id}>
                  <button
                    onClick={() => setCurrentItem(item)}
                    className={`w-full flex gap-3 px-4 py-2 transition-colors ${
                      isActive
                        ? 'bg-red-50 dark:bg-red-950/30'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {/* Video Thumbnail */}
                    <div className="relative flex-shrink-0 w-20 h-12 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={videoTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                          <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                        </div>
                      )}
                      {/* Duration overlay */}
                      <div className="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1 py-0.5 rounded">
                        {formatDuration(duration)}
                      </div>
                    </div>

                    {/* Video Title */}
                    <div className="flex-1 min-w-0 flex items-center">
                      <p
                        className={`text-sm font-medium text-left truncate leading-relaxed ${
                          isActive
                            ? 'text-[#EF343F] dark:text-red-300'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {videoTitle}
                      </p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default VideoPlaylist
