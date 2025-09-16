import { gql } from '@apollo/client'

export const GET_COLLECTION_COUNTS = gql`
  query GetCollectionCounts($ids: [ID!]!, $languageId: ID!) {
    videos(where: { ids: $ids, availableVariantLanguageIds: [$languageId] }) {
      id
      childrenCount
      slug
      label
      title(languageId: $languageId, primary: true) {
        value
      }
      primaryLanguageId
      publishedAt
    }
  }
`

export const GET_ONE_CHILD_BY_INDEX = gql`
  query GetOneChildByIndex($parentId: ID!, $languageId: ID!) {
    video(id: $parentId, idType: databaseId) {
      id
      slug
      children {
        id
        slug
        label
        images(aspectRatio: banner) {
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
        variant {
          id
          duration
          hls
          downloadable
          downloads {
            quality
            size
            url
          }
          language {
            id
            name {
              value
              primary
            }
            bcp47
          }
          slug
          subtitleCount
        }
        variantLanguagesCount
        childrenCount
      }
    }
  }
`

export const GET_SHORT_FILMS = gql`
  query GetShortFilms($languageId: ID!) {
    videos(
      where: { labels: [shortFilm], availableVariantLanguageIds: [$languageId] }
      limit: 100
    ) {
      id
      slug
      label
      images(aspectRatio: banner) {
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
      variant {
        id
        duration
        hls
        downloadable
        downloads {
          quality
          size
          url
        }
        language {
          id
          name {
            value
            primary
          }
          bcp47
        }
        slug
        subtitleCount
      }
      variantLanguagesCount
      childrenCount
    }
  }
`
