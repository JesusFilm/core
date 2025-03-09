import { MutationHookOptions, MutationTuple, useMutation } from '@apollo/client'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'

export const UPDATE_VIDEO_SUBTITLE = graphql(`
  mutation UpdateVideoSubtitle($input: VideoSubtitleUpdateInput!) {
    videoSubtitleUpdate(input: $input) {
      id
      value
      primary
      vttSrc
      srtSrc
      language {
        id
        name {
          value
          primary
        }
        slug
      }
      vttAsset {
        id
      }
      srtAsset {
        id
      }
      vttVersion
      srtVersion
    }
  }
`)

export type UpdateVideoSubtitleVariables = VariablesOf<
  typeof UPDATE_VIDEO_SUBTITLE
>
export type UpdateVideoSubtitle = ResultOf<typeof UPDATE_VIDEO_SUBTITLE>

export function useUpdateVideoSubtitleMutation(
  options?: MutationHookOptions<
    UpdateVideoSubtitle,
    UpdateVideoSubtitleVariables
  >
): MutationTuple<UpdateVideoSubtitle, UpdateVideoSubtitleVariables> {
  const mutation = useMutation<
    UpdateVideoSubtitle,
    UpdateVideoSubtitleVariables
  >(UPDATE_VIDEO_SUBTITLE, options)

  return mutation
}
