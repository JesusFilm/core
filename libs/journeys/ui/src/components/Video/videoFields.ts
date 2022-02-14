import { gql } from '@apollo/client'

export const VIDEO_FIELDS = gql`
  fragment VideoFields on VideoBlock {
    id
    parentBlockId
    parentOrder
    title
    muted
    autoplay
    startAt
    endAt
    posterBlockId
    fullsize
    videoContent {
      src
    }
  }
`
