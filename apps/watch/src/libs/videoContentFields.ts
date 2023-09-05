import { gql } from '@apollo/client'

export const VIDEO_CONTENT_FIELDS = gql`
  fragment VideoContentFields on Video {
    id
    label
    image
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
    }
    title(languageId: $languageId, primary: true) {
      value
    }
    variant(languageId: $languageId) {
      id
      duration
      hls
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
      }
      slug
      subtitleCount
    }
    variantLanguagesCount
    slug
    childrenCount
  }
`
