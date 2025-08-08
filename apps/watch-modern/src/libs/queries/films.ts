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

export const GET_COLLECTION_VIDEOS = gql`
  ${VIDEO_CONTENT_FIELDS}
  query GetCollectionVideos($collectionId: ID!, $languageId: ID!) {
    videos(
      where: { 
        id: $collectionId,
        published: true
      }
    ) {
      ...VideoContentFields
      children {
        id
      }
      childrenCount
    }
  }
`

export const GET_COLLECTION_CHILDREN = gql`
  query GetCollectionChildren($collectionId: ID!, $languageId: ID!) {
    video(id: $collectionId) {
      id
      label
      published
      title(languageId: $languageId, primary: true) {
        value
      }
      snippet(languageId: $languageId, primary: true) {
        value
      }
      description(languageId: $languageId, primary: true) {
        value
      }
      imageAlt(languageId: $languageId, primary: true) {
        value
      }
      images {
        mobileCinematicHigh
      }
      slug
      children {
        id
        label
        published
        title(languageId: $languageId, primary: true) {
          value
        }
        snippet(languageId: $languageId, primary: true) {
          value
        }
        description(languageId: $languageId, primary: true) {
          value
        }
        imageAlt(languageId: $languageId, primary: true) {
          value
        }
        images {
          mobileCinematicHigh
        }
        slug
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
      }
      childrenCount
    }
  }
`

// TODO: Add language preference support
// - Integrate with user language settings
// - Support dynamic language switching
// - Add language fallback chain 