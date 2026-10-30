import { TFunction } from 'i18next'

import { VideoLabel } from '../../../../../__generated__/globalTypes'

/**
 * The Watch label as the author reads it. Kept apart from `MediaPasteField`
 * so a settings body can read it without loading the lazily loaded field.
 */
export function videoLabelName(t: TFunction, label: VideoLabel): string {
  switch (label) {
    case VideoLabel.behindTheScenes:
      return t('Behind the scenes')
    case VideoLabel.collection:
      return t('Collection')
    case VideoLabel.episode:
      return t('Episode')
    case VideoLabel.featureFilm:
      return t('Feature film')
    case VideoLabel.segment:
      return t('Segment')
    case VideoLabel.series:
      return t('Series')
    case VideoLabel.shortFilm:
      return t('Short film')
    case VideoLabel.trailer:
      return t('Trailer')
  }
}

/** A Watch series or collection: in a carousel it expands into its children rather than becoming one card. */
export function isWatchContainer(
  label: VideoLabel | null | undefined
): boolean {
  return label === VideoLabel.series || label === VideoLabel.collection
}
