import { VideoLabel } from '../../../../__generated__/globalTypes'

interface LabelDetails {
  label: string
  color: string
  childLabel: string
}

export function getLabelDetails(videoLabel?: VideoLabel): LabelDetails {
  let label = 'Item'
  let color = '#FFF'
  let childLabel = 'items'

  switch (videoLabel) {
    case VideoLabel.collection:
      label = 'Collection'
      color = '#FF9E00'
      break
    case VideoLabel.episode:
      label = 'Episode'
      color = '#7283BE'
      break
    case VideoLabel.featureFilm:
      label = 'Feature Film'
      color = '#FF9E00'
      childLabel = 'chapters'
      break
    case VideoLabel.segment:
      label = 'Chapter'
      color = '#7283BE'
      break
    case VideoLabel.series:
      label = 'Series'
      color = '#3AA74A'
      childLabel = 'episodes'
      break
    case VideoLabel.shortFilm:
      label = 'Short Film'
      color = '#FF9E00'
      break
  }

  return { label, color, childLabel }
}
