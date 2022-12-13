import { VideoContentFields_children as VideoChildren } from '../../../../__generated__/VideoContentFields'
import { VideoLabel } from '../../../../__generated__/globalTypes'

// returns a unified and pluralized label for children
export function getChildrenLabel(children: VideoChildren[]): string {
  const res = children.reduce((accumulator, current) => {
    if (accumulator.label === current.label) {
      return accumulator
    } else {
      return { label: 'items' }
    }
  }, children[0])
  return pluralizeLabel(res.label)
}

function pluralizeLabel(label: string): string {
  switch (label) {
    case VideoLabel.collection:
      return 'collections'
    case VideoLabel.episode:
      return 'episodes'
    case VideoLabel.featureFilm:
      return 'featureFilms'
    case VideoLabel.segment:
      return 'segments'
    case VideoLabel.series:
      return 'series'
    case VideoLabel.shortFilm:
      return 'shortFilms'
    default:
      return label
  }
}
