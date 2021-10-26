import { gql } from '@apollo/client'

export const VIDEO_FIELDS = gql`
  fragment VideoFields on VideoBlock {
    id
    parentBlockId
    mediaComponentId
    languageId
    videoSrc: src
    title
    volume
    autoplay
    startAt
  }
`
