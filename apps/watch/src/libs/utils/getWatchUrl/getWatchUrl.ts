import { VideoLabel } from '../../../../__generated__/globalTypes'

export function getWatchUrl(
  containerSlug: string | undefined,
  label: VideoLabel | undefined,
  variantSlug: string | undefined
): string {
  if (!variantSlug) {
    return '/watch'
  }

  if (
    containerSlug != null &&
    label !== undefined &&
    ![VideoLabel.collection, VideoLabel.series].includes(label)
  ) {
    return `/watch/${containerSlug}.html/${variantSlug}.html`
  }

  const [videoId, languageId] = variantSlug.split('/')
  if (!videoId || !languageId) {
    return '/watch'
  }

  return `/watch/${videoId}.html/${languageId}.html`
}
