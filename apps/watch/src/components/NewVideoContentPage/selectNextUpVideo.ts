import last from 'lodash/last'

import { GetVideoChildren_video_children } from '../../../__generated__/GetVideoChildren'
import { VideoLabel } from '../../../__generated__/globalTypes'
import { getWatchUrl } from '../../libs/utils/getWatchUrl'

import { NextUpVideo } from './VideoContentHero/types'

interface SelectNextUpVideoInput {
  currentVideoId: string
  children: GetVideoChildren_video_children[]
  containerSlug?: string
  containerLabel?: VideoLabel | null
}

export function selectNextUpVideo({
  currentVideoId,
  children,
  containerSlug,
  containerLabel
}: SelectNextUpVideoInput): NextUpVideo | null {
  if (children.length === 0) return null

  const nextCandidate = children.find((child) => {
    return child.id !== currentVideoId && child.variant?.slug != null
  })

  if (nextCandidate == null || nextCandidate.variant?.slug == null) {
    return null
  }

  return {
    id: nextCandidate.id,
    title: last(nextCandidate.title)?.value ?? '',
    href: getWatchUrl(
      containerSlug,
      nextCandidate.label ?? containerLabel ?? undefined,
      nextCandidate.variant.slug
    ),
    durationSeconds: nextCandidate.variant.duration ?? undefined,
    image: nextCandidate.images[0]?.mobileCinematicHigh ?? undefined,
    imageAlt: nextCandidate.imageAlt[0]?.value ?? undefined
  }
}
