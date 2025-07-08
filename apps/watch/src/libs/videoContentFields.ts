import { gql } from '@apollo/client'

export const VIDEO_CONTENT_FIELDS = gql`
  fragment VideoContentFields on Video {
    id
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
    studyQuestions(languageId: $languageId, primary: true) {
      value
      primary
    }
    title(languageId: $languageId, primary: true) {
      value
    }
    variant(languageId: $languageId) {
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
    slug
    childrenCount
  }
`
