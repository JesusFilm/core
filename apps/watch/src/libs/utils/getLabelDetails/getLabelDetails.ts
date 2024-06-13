import { VideoLabel } from '../../../../__generated__/globalTypes'

interface LabelDetails {
  label: string
  color: string
  childLabel: string
  childCountLabel: string
}

export function getLabelDetails(
  videoLabel?: VideoLabel,
  count?: number
): LabelDetails {
  let label = 'Item'
  let color = '#FFF'
  let childLabel = 'Item'

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
      childLabel = 'Chapter'
      break
    case VideoLabel.segment:
      label = 'Chapter'
      color = '#7283BE'
      break
    case VideoLabel.series:
      label = 'Series'
      color = '#3AA74A'
      childLabel = 'Episode'
      break
    case VideoLabel.shortFilm:
      label = 'Short Film'
      color = '#FF9E00'
      break
    case VideoLabel.behindTheScenes:
      label = 'Behind The Scenes'
      color = '#FF9E00'
      break
    case VideoLabel.trailer:
      label = 'Trailer'
      color = '#FF9E00'
      break
  }

  const childCountLabel =
    count === 1 ? `${count} ${childLabel}` : `${count ?? 0} ${childLabel}s`

  return { label, color, childLabel, childCountLabel }
}
