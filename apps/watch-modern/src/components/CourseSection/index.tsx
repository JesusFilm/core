'use client'

import { Play } from 'lucide-react'
import type { KeyboardEvent, ReactElement } from 'react'

type CourseVideo = {
  id: string
  title: string
  subtitle: string
  duration: string
  languages: string
  image: string
}

export interface CourseSectionProps {
  isLoading?: boolean
}

const courseVideos: CourseVideo[] = [
  {
    id: 'nbc-01',
    title: 'The Simple Gospel',
    subtitle: 'Understanding the Good News',
    duration: '3:19',
    languages: 'MULTIPLE LANGUAGES',
    image: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F8_NBC01.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
  },
  {
    id: 'nbc-02',
    title: 'The Blood of Jesus',
    subtitle: 'The Power of His Sacrifice',
    duration: '1:49',
    languages: 'MULTIPLE LANGUAGES',
    image: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F8_NBC02.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
  },
  {
    id: 'nbc-03',
    title: 'Life After Death',
    subtitle: 'Eternal Hope in Christ',
    duration: '1:34',
    languages: 'MULTIPLE LANGUAGES',
    image: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F8_NBC03.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
  },
  {
    id: 'nbc-04',
    title: "God's Forgiveness",
    subtitle: 'Grace and Mercy',
    duration: '1:45',
    languages: 'MULTIPLE LANGUAGES',
    image: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F8_NBC04.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
  },
  {
    id: 'nbc-05',
    title: 'Savior, Lord, and Friend',
    subtitle: 'Jesus in Your Life',
    duration: '1:57',
    languages: 'MULTIPLE LANGUAGES',
    image: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F8_NBC05.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
  },
  {
    id: 'nbc-06',
    title: 'Being Made New',
    subtitle: 'Your New Life in Christ',
    duration: '1:19',
    languages: 'MULTIPLE LANGUAGES',
    image: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F8_NBC06.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
  },
  {
    id: 'nbc-07',
    title: 'Living for God',
    subtitle: 'Walking in His Ways',
    duration: '1:41',
    languages: 'MULTIPLE LANGUAGES',
    image: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F8_NBC07.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
  },
  {
    id: 'nbc-08',
    title: 'The Bible',
    subtitle: "God's Word for You",
    duration: '1:30',
    languages: 'MULTIPLE LANGUAGES',
    image: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F8_NBC08.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
  },
  {
    id: 'nbc-09',
    title: 'Prayer',
    subtitle: 'Connecting with God',
    duration: '1:28',
    languages: 'MULTIPLE LANGUAGES',
    image: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F8_NBC09.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
  },
  {
    id: 'nbc-10',
    title: 'Church',
    subtitle: 'Finding Your Community',
    duration: '1:40',
    languages: 'MULTIPLE LANGUAGES',
    image: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F8_NBC10.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
  },
]

export function CourseSection(props: CourseSectionProps): ReactElement {
  const { isLoading = false } = props

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }
    event.preventDefault()
    // Navigation will be implemented in future slices
  }

  const handleSeeAllClick = () => {
    // Navigation to course page will be implemented in future slices
    console.log('Navigate to course page')
  }

  return (
    <section className="min-h-screen bg-stone-950 py-16 scroll-snap-start-always text-white relative" role="region" aria-label="New Believer Course">
      {/* Background Image - Bottom Layer */}
      <div
        className="absolute left-0 right-0 top-0 w-full aspect-[32/15] opacity-60"
        style={{
          backgroundImage:
            'url("https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F8_NBC.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          mask: 'linear-gradient(to bottom, white 0%, white 50%, transparent 100%)',
          WebkitMask: 'linear-gradient(to bottom, white 0%, white 50%, transparent 100%)',
        }}
      />

      {/* Gradient Overlay - Middle Layer */}
      <div className="absolute inset-0 bg-gradient-to-tr from-red-950/40 via-orange-750/30 to-yellow-550/10" />

      {/* Texture Overlay - Top Layer */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'url("https://www.jesusfilm.org/_next/static/media/overlay.d86a559d.svg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Header Section - Constrained */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-20 py-12 relative z-10">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-12 gap-6">
          <div className="max-w-6xl">
            <p className="text-stone-200/80 text-sm tracking-[0.3em] uppercase mb-8 font-medium text-[rgba(255,255,255,0.6)]">
              VIDEO COURSE
            </p>
            <h2 className="text-2xl sm:text-3xl xl:text-4xl 2xl:text-5xl font-bold leading-[0.95] tracking-tight text-white mb-6">
              New Believer Course
            </h2>
            <p className="text-stone-100/90 text-lg sm:text-xl leading-relaxed max-w-3xl text-[rgba(255,255,255,0.9)]">
              If you've ever wondered what Christianity is about, or what sort of lifestyle it empowers you to live, the New Believer Course exists to help you understand the Gospel and live your life in response to it.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSeeAllClick}
            aria-label="see all course videos"
            className="bg-white text-slate-900 hover:bg-blue-50 px-6 sm:px-10 py-3 sm:py-4 rounded-full font-semibold tracking-wide transition-all duration-200 flex items-center gap-3 mt-8 shadow-2xl hover:shadow-white/20 self-start"
          >
            SEE ALL
          </button>
        </div>
      </div>

      {/* Video Grid - YouTube Style */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-20 relative z-10 mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {isLoading
            ? Array.from({ length: 10 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="group cursor-pointer">
                  {/* Video Thumbnail Skeleton */}
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-slate-800 shadow-2xl animate-pulse">
                    <div className="w-full h-full bg-slate-700" />
                    {/* Episode Number Skeleton */}
                    <div className="absolute top-2 left-2 w-8 h-8 bg-slate-600 rounded" />
                    {/* Duration Badge Skeleton */}
                    <div className="absolute bottom-2 right-2 w-12 h-6 bg-slate-600 rounded" />
                  </div>
                  {/* Video Info Skeleton */}
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-3/4" data-testid="item-loading-skeleton" />
                    <div className="h-3 bg-slate-700 rounded w-1/2" data-testid="item-loading-skeleton" />
                  </div>
                </div>
              ))
            : courseVideos.map((video, index) => (
                <div key={video.id} className="group cursor-pointer">
                  {/* Video Thumbnail */}
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-slate-800 shadow-2xl hover:shadow-3xl transition-all duration-300">
                    <img
                      src={video.image}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Opacity Gradient Overlay for Episode Number */}
                    <div
                      className="absolute top-0 left-0 w-32 h-24 backdrop-blur-sm"
                      style={{
                        background:
                          'radial-gradient(ellipse at top left, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)',
                        mask: 'radial-gradient(ellipse at top left, white 0%, rgba(255,255,255,0.8) 30%, rgba(255,255,255,0.4) 60%, transparent 100%)',
                        WebkitMask:
                          'radial-gradient(ellipse at top left, white 0%, rgba(255,255,255,0.8) 30%, rgba(255,255,255,0.4) 60%, transparent 100%)',
                      }}
                    />

                    {/* Episode Number Badge */}
                    <div
                      className="absolute top-2 left-2 text-2xl sm:text-3xl lg:text-[48px] font-bold leading-none text-white"
                      data-number={index + 1}
                      style={{
                        mixBlendMode: 'overlay',
                        textShadow:
                          '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4)',
                        mask: 'linear-gradient(to bottom, orange-200 50%, rgba(255,255,255,0.7) 70%, rgba(255,255,255,0.5) 100%)',
                        WebkitMask:
                          'linear-gradient(to bottom, orange-200 50%, rgba(255,255,255,0.7) 70%, rgba(255,255,255,0.5) 100%)',
                      }}
                    >
                      {index + 1}
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-medium flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 fill-white" />
                      {video.duration}
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-lg">
                        <Play className="w-4 h-4 sm:w-6 sm:h-6 text-slate-900 fill-slate-900" />
                      </div>
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="space-y-1">
                    <h3 className="text-white font-semibold leading-tight line-clamp-2 group-hover:text-stone-200 transition-colors duration-200 text-sm sm:text-base">
                      {video.title}
                    </h3>
                    <p className="text-stone-200/80 text-xs sm:text-sm leading-relaxed line-clamp-2">
                      {video.subtitle}
                    </p>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {/* Course Info Text - Constrained */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-20 relative z-10 mb-12">
        <p className="text-base sm:text-lg xl:text-xl mt-4 leading-relaxed text-stone-200/80 text-[20px]">
          <span className="text-white font-bold">This course</span> is designed to help new believers understand the basics of Christian faith. Each video covers essential topics that will strengthen your foundation and guide you as you begin your journey with Jesus Christ.
        </p>
      </div>
    </section>
  )
}
