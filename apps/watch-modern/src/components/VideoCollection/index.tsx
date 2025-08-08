'use client'

import { useQuery } from '@apollo/client'
import { Play } from "lucide-react"
import Image from "next/image"

import { GET_VIDEOS } from '@/libs/queries/films'

interface CloudflareImage {
  mobileCinematicHigh: string
}

interface Video {
  id: string
  label: string
  images: CloudflareImage[]
  imageAlt: {
    value: string
  }[]
  snippet: {
    value: string
  }[]
  description: {
    value: string
  }[]
  title: {
    value: string
  }[]
  variant: {
    id: string
    duration: number
    language: {
      id: string
      name: {
        value: string
        primary: boolean
      }
      bcp47: string
    }
    slug: string
  }
  variantLanguagesCount: number
  slug: string
}

interface GetVideosData {
  videos: Video[]
}

interface GetVideosVars {
  languageId: string
  limit: number
}

export function VideoCollection() {
  const { data, loading, error } = useQuery<GetVideosData, GetVideosVars>(GET_VIDEOS, {
    variables: {
      languageId: '529', // English language ID
      limit: 6
    },
    errorPolicy: 'all', // Don't throw on network errors
    notifyOnNetworkStatusChange: false,
    fetchPolicy: 'cache-and-network'
  })

  const handleVideoClick = (videoId: string) => {
    // Navigate to video detail page
    window.location.href = `/watch/${videoId}`
  }

  const sectionTitle = "VIDEO BIBLE COLLECTION"
  const mainHeading = "Video Gospel in every style and language"
  const description = "Experience the life of Jesus through authentic, faithful films translated into thousands of languages worldwide."
  const missionTitle = "Our mission"
  const missionText = "is to introduce people to the Bible through films and videos that faithfully bring the Gospels to life. By visually telling the story of Jesus and God's love for humanity, we make Scripture more accessible, engaging, and easy to understand."
  const errorTitle = "Error Loading Films"
  const errorMessage = "Unable to load video content. Please try again later."

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours} HR ${minutes} MIN`
    }
    return `${minutes} MIN`
  }

  const formatLanguageCount = (count: number): string => {
    if (count >= 2000) {
      return "2000+ LANGUAGES"
    } else if (count >= 1000) {
      return "1000+ LANGUAGES"
    } else if (count >= 500) {
      return "500+ LANGUAGES"
    } else if (count >= 100) {
      return "100+ LANGUAGES"
    } else {
      return `${count}+ LANGUAGES`
    }
  }

  if (loading) {
    return (
      <section className="min-h-screen bg-slate-950 bg-gradient-to-tr from-blue-950/10 via-purple-950/10 to-[#91214A]/90 py-16 scroll-snap-start-always text-white relative">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-20 py-12 relative z-10">
          <div className="flex justify-between items-start mb-12">
            <div className="max-w-5xl">
              <p className="text-stone-200/80 text-sm tracking-[0.3em] uppercase mb-8 font-medium text-[rgba(255,255,255,0.6)]">
                {sectionTitle}
              </p>
              <h2 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold leading-[0.95] tracking-tight text-white mb-6">
                {mainHeading}
              </h2>
              <p className="text-stone-100/90 text-xl leading-relaxed max-w-3xl text-[rgba(255,255,255,0.9)]">
                {description}
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-20 relative z-10 mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-16 sm:gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="w-[75%] sm:w-auto mx-auto sm:mx-0">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-slate-800 animate-pulse">
                  <div className="absolute inset-0 bg-slate-700"></div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-stone-200/80 text-xs uppercase tracking-wider mb-2">
                    <div className="h-4 bg-slate-700 rounded animate-pulse w-16" data-testid="loading-skeleton"></div>
                    <span className="w-1 h-1 bg-stone-200/60 rounded-full"></span>
                    <div className="h-4 bg-slate-700 rounded animate-pulse w-20" data-testid="loading-skeleton"></div>
                  </div>
                  <div className="h-6 bg-slate-700 rounded animate-pulse mb-2" data-testid="loading-skeleton"></div>
                  <div className="h-4 bg-slate-700 rounded animate-pulse" data-testid="loading-skeleton"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="min-h-screen bg-slate-950 bg-gradient-to-tr from-blue-950/10 via-purple-950/10 to-[#91214A]/90 py-16 scroll-snap-start-always text-white relative">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-20 py-12 relative z-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">{errorTitle}</h2>
            <p className="text-stone-200/80">{errorMessage}</p>
          </div>
        </div>
      </section>
    )
  }

  const videos = data?.videos || []

  return (
    <section className="min-h-screen bg-slate-950 bg-gradient-to-tr from-blue-950/10 via-purple-950/10 to-[#91214A]/90 py-16 scroll-snap-start-always text-white relative">
      {/* Texture Overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'url("https://www.jesusfilm.org/_next/static/media/overlay.d86a559d.svg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Header Section - Constrained */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-20 py-12 relative z-10">
        <div className="flex justify-between items-start mb-12">
          <div className="max-w-5xl">
            <p className="text-stone-200/80 text-sm tracking-[0.3em] uppercase mb-8 font-medium text-[rgba(255,255,255,0.6)]">
              {sectionTitle}
            </p>
            <h2 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold leading-[0.95] tracking-tight text-white mb-6">
              {mainHeading}
            </h2>
            <p className="text-stone-100/90 text-xl leading-relaxed max-w-3xl text-[rgba(255,255,255,0.9)]">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Video Grid - Basic Static Grid */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-20 relative z-10 mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-16 sm:gap-6">
          {videos.map((video) => {
            // Get the first image from the array, or use a fallback
            const firstImage = video.images?.[0]
            const imageUrl = firstImage?.mobileCinematicHigh || '/placeholder-image.jpg'
            
            // Get the first title, snippet, description, and imageAlt from their arrays
            const videoTitle = video.title?.[0]?.value
            const videoImageAlt = video.imageAlt?.[0]?.value || videoTitle || 'Video'
            
            return (
              <div 
                key={video.id} 
                className="group cursor-pointer w-[75%] sm:w-auto mx-auto sm:mx-0"
                onClick={() => handleVideoClick(video.slug)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleVideoClick(video.slug)
                  }
                }}
                aria-label={`Watch ${videoTitle || 'Video'}`}
              >
                {/* Video Thumbnail */}
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-slate-800 shadow-2xl hover:shadow-3xl transition-all duration-300">
                  <Image
                    src={imageUrl}
                    alt={videoImageAlt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Opacity Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-80" />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 border border-white/30">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-medium flex items-center gap-1">
                    <Play className="w-2.5 h-2.5 fill-white" />
                    {formatDuration(video.variant?.duration || 0)}
                  </div>
                </div>

                {/* Video Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-stone-200/80 text-xs uppercase tracking-wider mb-2">
                    <span>{formatDuration(video.variant?.duration || 0)}</span>
                    <span className="w-1 h-1 bg-stone-200/60 rounded-full"></span>
                    <span>{formatLanguageCount(video.variantLanguagesCount || 0)}</span>
                  </div>
                  <h3 className="text-white text-3xl font-semibold leading-tight line-clamp-2 group-hover:text-stone-200 transition-colors duration-200">
                    {videoTitle || 'Video Title'}
                  </h3>
                  <p className="text-stone-100/90 text-sm leading-relaxed line-clamp-2">
                    {video.snippet?.[0]?.value || video.description?.[0]?.value || ''}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mission Text - Constrained */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-20 relative z-10 mb-12">
        <p className="text-lg xl:text-xl mt-0 leading-relaxed text-stone-200/80 text-[20px]">
          <span className="text-white font-bold">
            {missionTitle}
          </span>{" "}
          {missionText}
        </p>
      </div>
    </section>
  )
} 