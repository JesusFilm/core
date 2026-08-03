export const videoStatuses = [
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'unpublished' }
]

export const videoLabels = [
  { label: 'Collection', value: 'collection' },
  { label: 'Episode', value: 'episode' },
  { label: 'Feature Film', value: 'featureFilm' },
  { label: 'Clip', value: 'segment' },
  { label: 'Series', value: 'series' },
  { label: 'Short Film', value: 'shortFilm' },
  { label: 'Trailer/Preview', value: 'trailer' },
  { label: 'Behind The Scenes', value: 'behindTheScenes' }
] as const

export type VideoLabelValue = (typeof videoLabels)[number]['value']

/**
 * The `videoLabels` values as a non-empty tuple, so consumers that need the
 * bare values (zod enums, yup `oneOf`) derive them from the same source as the
 * display labels rather than restating the list.
 */
export const videoLabelValues = videoLabels.map(({ value }) => value) as [
  VideoLabelValue,
  ...VideoLabelValue[]
]
