import { gql } from '@apollo/client'

export const VIDEO_SEARCH_FIELDS = gql`
  fragment VideoSearchFields on Video {
    id
    slug
    label
    title(languageId: $languageId, primary: true) {
      value
    }
    description(languageId: $languageId, primary: true) {
      value
    }
    images(aspectRatio: banner) {
      mobileCinematicHigh
    }
    variant(languageId: $languageId) {
      id
      hls
      duration
      downloadable
      downloads {
        quality
        size
        url
        height
        width
      }
      language {
        id
        bcp47
        name {
          value
          primary
        }
      }
    }
    availableLanguages
    variantLanguagesCount
  }
`

export const SEARCH_VIDEOS = gql`
  query SearchVideos($where: VideosFilter, $offset: Int, $limit: Int, $languageId: ID) {
    videos(where: $where, offset: $offset, limit: $limit) {
      ...VideoSearchFields
    }
  }
  ${VIDEO_SEARCH_FIELDS}
`

export const GET_VIDEO = gql`
  query GetVideo($id: ID!, $idType: IdType, $languageId: ID) {
    video(id: $id, idType: $idType) {
      ...VideoSearchFields
      studyQuestions(languageId: $languageId, primary: true) {
        value
      }
      bibleCitations {
        bibleBook {
          name {
            value
          }
        }
        chapterStart
        chapterEnd
        verseStart
        verseEnd
      }
    }
  }
  ${VIDEO_SEARCH_FIELDS}
`
