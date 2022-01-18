import { gql } from '@apollo/client'

export const VIDEO_FIELDS = gql`
  fragment VideoFields on VideoBlock {
    id
    journeyId
    parentBlockId
    title
    muted
    autoplay
    startAt
    endAt
    posterBlockId
    videoContent {
      src
    }
  }
`
