import { gql } from '@apollo/client'

export const VIDEO_FIELDS = gql`
  fragment VideoFields on VideoBlock {
    id
    parentBlockId
    title
    muted
    autoplay
    startAt
    endAt
    videoContent {
      src
    }
  }
`
