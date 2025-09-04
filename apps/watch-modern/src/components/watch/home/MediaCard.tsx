/**
 * MediaCard Component
 *
 * A reusable card component for displaying media content with labels and duration.
 * Matches the visual design of https://www.jesusfilm.org/watch
 */

import Image from 'next/image'
import Link from 'next/link'
import { Play } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { cn } from '@/lib/utils'
import type { MediaKind } from '@/lib/media-utils'
import { kindToLabel, kindToColor, formatDuration } from '@/lib/media-utils'

/**
 * Props for the MediaCard component
 */
export type MediaCardProps = {
  /** Link URL for the media item */
  href: string
  /** Display title of the media item */
  title: string
  /** Type of media content */
  kind: MediaKind
  /** Optional count label (e.g., "61 chapters", "7 episodes", "80 items") */
  countLabel?: string | undefined
  /** Optional duration in seconds - if present, shows time pill with play icon */
  durationSeconds?: number | undefined
  /** Optional image URL for the media thumbnail */
  imageUrl?: string | undefined
  /** Additional CSS classes */
  className?: string | undefined
}

/**
 * MediaCard component for displaying media content in a grid layout
 */
export function MediaCard({
  href,
  title,
  kind,
  countLabel,
  durationSeconds,
  imageUrl,
  className
}: MediaCardProps) {
  const typeClass = kindToColor(kind)
  const hasDuration = durationSeconds !== undefined && durationSeconds > 0
  const hasCountLabel = countLabel && countLabel.trim() !== ''

  return (
    <Link
      href={href}
      aria-label={`${title} – open details`}
      className="group focus-visible:outline-none rounded-xl block"
    >
      <Card className={cn(
        "rounded-xl overflow-hidden border-0 shadow-none",
        className
      )}>
        <div className="relative shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.6)] transition-shadow duration-300 rounded-xl overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 border border-white/10">
          <AspectRatio ratio={16 / 9}>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt=""
                fill
                priority={false}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.01]"
              />
            ) : (
              <div className="h-full w-full bg-neutral-800 flex items-center justify-center">
                <div className="text-center text-neutral-400">
                  <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">No Image</div>
                </div>
              </div>
            )}
          </AspectRatio>

          {/* Content overlay - duration/count pill */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute bottom-3 right-3">
              {/* Right side: Duration or count pill */}
              {(hasDuration || hasCountLabel) && (
                <div className="shrink-0 flex items-center gap-1.5 rounded-md bg-black/55 text-white text-xs font-medium px-2 py-0.5 backdrop-blur-[2px]">
                  {hasDuration && (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      {formatDuration(durationSeconds!)}
                    </>
                  )}
                  {hasCountLabel && !hasDuration && countLabel}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Type label and title below thumbnail */}
        <div className="py-4">
          <div className={cn(
            'text-xs font-semibold uppercase tracking-wide mb-1',
            typeClass
          )}>
            {kindToLabel(kind)}
          </div>
          <div className="text-foreground font-semibold text-lg leading-tight line-clamp-2">
            {title}
          </div>
        </div>
      </Card>
    </Link>
  )
}
