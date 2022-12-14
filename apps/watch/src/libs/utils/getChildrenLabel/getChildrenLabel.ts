import { VideoLabel } from '../../../../__generated__/globalTypes'

export function getChildrenLabel(label: VideoLabel): string {
  switch (label) {
    case VideoLabel.collection:
      return 'items'
    case VideoLabel.series:
      return 'episodes'
    case VideoLabel.featureFilm:
      return 'chapters'
    default:
      return 'items'
  }
}
