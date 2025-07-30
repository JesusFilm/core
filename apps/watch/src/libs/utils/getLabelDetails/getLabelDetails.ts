import { TFunction } from 'next-i18next'

import { VideoLabel } from '../../../../__generated__/globalTypes'

interface LabelDetails {
  label: string
  color: string
  childLabel: string
  childCountLabel: string
}

export function getLabelDetails(
  t: TFunction,
  videoLabel?: VideoLabel,
  count?: number
): LabelDetails {
  let label = t('Item')
  let color = '#FFF'
  let childLabel = t('Item')

  switch (videoLabel) {
    case VideoLabel.collection:
      label = t('Collection')
      color = '#FF9E00'
      break
    case VideoLabel.episode:
      label = t('Episode')
      color = '#7283BE'
      break
    case VideoLabel.featureFilm:
      label = t('Feature Film')
      color = '#FF9E00'
      childLabel = t('Chapter')
      break
    case VideoLabel.segment:
      label = t('Chapter')
      color = '#7283BE'
      break
    case VideoLabel.series:
      label = t('Series')
      color = '#3AA74A'
      childLabel = t('Episode')
      break
    case VideoLabel.shortFilm:
      label = t('Short Film')
      color = '#FF9E00'
      break
    case VideoLabel.behindTheScenes:
      label = t('Behind The Scenes')
      color = '#FF9E00'
      break
    case VideoLabel.trailer:
      label = t('Trailer')
      color = '#FF9E00'
      break
  }

  const childCountLabel =
    count === 1 ? `${count} ${childLabel}` : `${count ?? 0} ${childLabel}s`

  return { label, color, childLabel, childCountLabel }
}
