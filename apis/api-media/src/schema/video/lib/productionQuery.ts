import { graphql } from '../../../lib/graphql/subgraphGraphql'

export const GetVideoQuery = graphql(`
  query GetVideo($id: ID!) {
    video(id: $id) {
      id
      label
      locked
      primaryLanguageId
      published
      availableLanguages
      bibleCitations {
        id
        bibleBookId
        osisId
        chapterStart
        chapterEnd
        verseStart
        verseEnd
        order
      }
      title {
        id
        value
        primary
        languageId
      }
      description {
        id
        value
        primary
        languageId
      }
      studyQuestions {
        id
        value
        primary
        languageId
        order
        crowdInId
      }
      variants {
        id
        slug
        duration
        hls
        languageId
        published
        edition
        downloads {
          id
          quality
          size
          url
          height
          width
          version
        }
      }
      cloudflareAssets {
        id
        url
        height
        width
        videoId
        aspectRatio
      }
      videoEditions {
        id
        name
        videoId
      }
      subtitles {
        id
        videoId
        edition
        vttSrc
        srtSrc
        primary
        languageId
        vttVersion
        srtVersion
      }
    }
  }
`)
