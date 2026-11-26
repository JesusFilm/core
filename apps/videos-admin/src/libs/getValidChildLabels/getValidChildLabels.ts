import { VideoLabelValue, videoLabels } from '../../constants'

const validChildLabelValues: Partial<
  Record<string, { values: VideoLabelValue[]; suggested: VideoLabelValue }>
> = {
  collection: {
    values: ['episode', 'featureFilm', 'shortFilm', 'series'],
    suggested: 'episode'
  },
  featureFilm: {
    values: ['segment', 'trailer', 'behindTheScenes'],
    suggested: 'segment'
  },
  series: {
    values: ['episode', 'trailer', 'behindTheScenes'],
    suggested: 'episode'
  },
  episode: {
    values: ['segment', 'trailer', 'behindTheScenes'],
    suggested: 'segment'
  }
}

/**
 * The labels a child video may carry under a parent with `parentLabel`, and
 * the one to suggest. A parent without child restrictions allows every label.
 */
export function getValidChildLabels(parentLabel?: string): {
  validChildLabels: ReadonlyArray<(typeof videoLabels)[number]>
  suggestedLabel: VideoLabelValue | undefined
} {
  const rule =
    parentLabel == null ? undefined : validChildLabelValues[parentLabel]
  if (rule == null)
    return { validChildLabels: videoLabels, suggestedLabel: undefined }

  return {
    validChildLabels: videoLabels.filter(({ value }) =>
      rule.values.includes(value)
    ),
    suggestedLabel: rule.suggested
  }
}
