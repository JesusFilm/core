import { gql } from '@apollo/client'

export const VIDEO_FIELDS = gql`
  fragment VideoFields on VideoBlock {
    id
    parentBlockId
    parentOrder
    muted
    autoplay
    startAt
    endAt
    posterBlockId
    fullsize
    videoId
    videoVariantLanguageId
    video {
      id
      title(primary: true) {
        value
      }
      variant {
        id
        hls
      }
    }
  }
`
