import { gql } from '@apollo/client'

export const VIDEO_CHILD_FIELDS = gql`
  fragment VideoChildFields on Video {
    id
    label
    title(languageId: $languageId, primary: true) {
      value
    }
    images(aspectRatio: banner) {
      mobileCinematicHigh
    }
    imageAlt(languageId: $languageId, primary: true) {
      value
    }
    snippet(languageId: $languageId, primary: true) {
      value
    }
    slug
    variant(languageId: $languageId) {
      id
      duration
      hls
      slug
    }
    childrenCount
  }
`
