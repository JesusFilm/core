import { VideoChildFields } from '../../../../../__generated__/VideoChildFields'

// Temporary default variant logic due to paywall
// Currently being set through a custom seed logic
// Need to do variant logic here once past paywall
export function convertAlgoliaVideos(videos, languageIds): VideoChildFields[] {
  return videos.map((video) => {
    function findVariantSlug(variants, languageIds): string | undefined {
      return variants.find((variant) => variant.languageId === languageIds[0])
        ?.slug
    }

    // video.variant is a temporary fix
    // Everything in it will be removed once we're past paywall
    const variant =
      languageIds != null
        ? {
            duration: video.variant.duration,
            slug:
              findVariantSlug(video.variants, languageIds) ?? video.variant.slug
          }
        : undefined

    const videoFields = {
      ...video,
      title: [{ value: video.titles[0] }],
      imageAlt: [{ value: video.imageAlt }],
      snippet: [{ value: video.snippet }]
    }

    if (variant != null) {
      videoFields.variant = {
        duration: variant.duration,
        slug: variant.slug
      }
    }
    return videoFields
  })
}
