import { useQuery } from '@apollo/client'
import { graphql } from 'gql.tada'

export const GET_VIDEO_VARIANT = graphql(`
  query GetVideoVariant($videoId: ID!, $variantId: ID!) {
    videoVariant(id: $videoId) {}
  }`)

export function useVideoVariant() {
  // const query = useQuery(GET_VIDEO_VARIANT, options)
}
