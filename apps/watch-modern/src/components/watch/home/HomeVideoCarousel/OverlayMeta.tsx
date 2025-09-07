import Link from 'next/link'
import { CarouselVideoItem } from '@/server/getCarouselVideos'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { buildWatchNowUrl } from '@/lib/urlUtils'

interface OverlayMetaProps {
  video: CarouselVideoItem
  watchUrl: string
}

/**
 * Overlay metadata component showing video title, type, description, languages, and Watch Now button
 */
export function OverlayMeta({ video, watchUrl }: OverlayMetaProps) {
  // Map label to user-friendly type
  const getVideoType = (label: string) => {
    const typeMap: Record<string, string> = {
      'film': 'Film',
      'series': 'Series',
      'documentary': 'Documentary',
      'course': 'Course',
      'story': 'Story',
      'testimony': 'Testimony'
    }
    return typeMap[label.toLowerCase()] || label
  }

  const watchNowUrl = buildWatchNowUrl(watchUrl, video.slug, video.languageSlugOverride)

  return (
    <Container className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8 lg:p-12">
      <div className="w-full sm:w-1/2 lg:w-1/2 space-y-2 sm:space-y-3">
        {/* Title */}
        <h1
          className="text-carousel-title font-bold text-white leading-tight"
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            lineHeight: '1.1'
          }}
        >
          {video.title || 'Untitled Video'}
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-1">

        {/* Video Type Badge */}
        <div
          className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-carousel-meta font-medium text-white focus-ring"
          role="status"
          aria-label={`Video type: ${getVideoType(video.label)}`}
        >
          {getVideoType(video.label)}
        </div>
        {/* Languages Available */}
        <div
            className="text-carousel-meta text-white/70"
            aria-label={`${video.variantLanguagesCount} language${video.variantLanguagesCount !== 1 ? 's' : ''} available`}
          >
            Available in {video.variantLanguagesCount} language{video.variantLanguagesCount !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Description with enhanced truncation */}
        <p
          className="text-carousel-description text-white/80 leading-relaxed"
          style={{
            fontSize: '1rem',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
          aria-label={`Video description: ${video.description || 'No description available'}`}
        >
          {video.description || 'No description available'}
        </p>

        {/* Languages and Watch Now */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-1">
          

          {/* Watch Now Button */}
          <Button
            asChild
            size="lg"
            className="bg-white text-black hover:bg-white/90 font-semibold px-6 sm:px-8 py-3 rounded-full transition-all duration-200 hover:scale-105 focus-ring pointer-events-auto"
          >
            <Link
              href={watchNowUrl}
              className="flex items-center gap-2"
              aria-label={`Watch ${video.title || 'this video'} now - opens in new tab`}
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              Watch Now
            </Link>
          </Button>
        </div>
      </div>
    </Container>
  )
}
