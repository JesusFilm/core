import { gql } from '@apollo/client'

import { ACTION_FIELDS } from '../../libs/action/actionFields'

export const VIDEO_FIELDS = gql`
  ${ACTION_FIELDS}
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
    source
    title
    description
    image
    duration
    objectFit
    mediaVideo {
      ... on Video {
        id
        title(primary: true) {
          value
        }
        images(aspectRatio: banner) {
          mobileCinematicHigh
        }
        variant {
          id
          hls
        }
        variantLanguages {
          id
          name {
            value
            primary
          }
        }
      }
      ... on MuxVideo {
        id
        assetId
        playbackId
      }
      ... on YouTube {
        id
      }
    }
    action {
      ...ActionFields
    }
  }
`
