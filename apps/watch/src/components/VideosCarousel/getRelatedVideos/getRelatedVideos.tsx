import { VideoLabel } from '../../../../__generated__/globalTypes'
import { VideoContentFields_children as VideoChildren } from '../../../../__generated__/VideoContentFields'

export function getUniqueSiblings({
  siblings,
  children
}: {
  siblings: VideoChildren[]
  children: VideoChildren[]
}): VideoChildren[] {
  return siblings.filter((siblingVideo) => {
    return (
      children.findIndex((childVideo) => childVideo.id === siblingVideo.id) < 0
    )
  })
}

export function getSortedChildren(
  children: VideoChildren[]
): Array<VideoChildren | VideoChildren[]> {
  const sorted: Array<VideoChildren | VideoChildren[]> = []
  const episodes: VideoChildren[] = []
  const segments: VideoChildren[] = []

  children.forEach((video) => {
    switch (video.label) {
      case VideoLabel.episode:
        if (episodes.length === 0) {
          sorted.push(episodes)
        }
        episodes.push(video)
        break
      case VideoLabel.segment:
        if (segments.length === 0) {
          sorted.push(segments)
        }
        segments.push(video)
        break
      default:
        sorted.push(video)
        break
    }
  })

  return sorted
}

export function getRelatedVideos({
  siblings,
  children
}: {
  siblings?: VideoChildren[]
  children: VideoChildren[]
}): Array<VideoChildren | VideoChildren[]> {
  const sortedChildren = getSortedChildren(children)

  if (siblings != null) {
    const uniqueSiblings = getUniqueSiblings({ siblings, children })

    return sortedChildren.length > 0
      ? sortedChildren.concat(uniqueSiblings)
      : siblings
  }

  return sortedChildren
}
