import { gql } from '@apollo/client'

export const VIDEO_FIELDS = gql`
  fragment VideoFields on VideoBlock {
    id
    parentBlockId
    title
    volume
    autoplay
    startAt
    video {
      src
      ... on VideoArclight {
        mediaComponentId
        languageId
      }
    }
  }
`
