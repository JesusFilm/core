import { gql } from '@apollo/client'

export const VIDEO_CONTENT_FIELDS = gql`
  fragment VideoContentFields on Video {
    id
    label
    images {
      mobileCinematicHigh
    }
    imageAlt(languageId: $languageId, primary: true) {
      value
    }
    snippet(languageId: $languageId, primary: true) {
      value
    }
    description(languageId: $languageId, primary: true) {
      value
    }
    title(languageId: $languageId, primary: true) {
      value
    }
    variant(languageId: $languageId) {
      id
      duration
      language {
        id
        name {
          value
          primary
        }
        bcp47
      }
      slug
    }
    variantLanguagesCount
    slug
    published
  }
`

export const GET_VIDEOS = gql`
  ${VIDEO_CONTENT_FIELDS}
  query GetVideos($languageId: ID!, $limit: Int) {
    videos(
      where: { 
        availableVariantLanguageIds: [$languageId],
        published: true,
        labels: [featureFilm]
      }
      limit: $limit
    ) {
      ...VideoContentFields
    }
  }
` 