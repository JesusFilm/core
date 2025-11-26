import { gql } from '@apollo/client'

export const COLLECTION_SHOWCASE_VIDEO_FIELDS = gql`
  fragment CollectionShowcaseVideoFields on Video {
    id
    label
    slug
    title(languageId: $languageId, primary: true) {
      value
    }
    snippet(languageId: $languageId, primary: true) {
      value
    }
    imageAlt(languageId: $languageId, primary: true) {
      value
    }
    variant(languageId: $languageId) {
      id
      duration
      hls
      slug
    }
    posterImages: images(aspectRatio: hd) {
      mobileCinematicHigh
    }
    bannerImages: images(aspectRatio: banner) {
      mobileCinematicHigh
    }
    parents {
      id
      slug
      label
    }
    childrenCount
  }
`

export const GET_COLLECTION_SHOWCASE_CONTENT = gql`
  ${COLLECTION_SHOWCASE_VIDEO_FIELDS}
  query GetCollectionShowcaseContent(
    $ids: [ID!]
    $languageId: ID!
  ) {
    videos(
      where: { ids: $ids }
    ) {
      ...CollectionShowcaseVideoFields
      description(languageId: $languageId, primary: true) {
        value
      }
      children {
        ...CollectionShowcaseVideoFields
        children {
          ...CollectionShowcaseVideoFields
        }
      }
    }
  }
`
