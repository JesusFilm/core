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
    video {
      variant {
        hls
      }
    }
  }
`
