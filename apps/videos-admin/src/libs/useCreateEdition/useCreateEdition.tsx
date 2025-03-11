import { MutationHookOptions, MutationTuple, useMutation } from '@apollo/client'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'

export const CREATE_VIDEO_EDITION = graphql(`
  mutation CreateVideoEdition($input: VideoEditionCreateInput!) {
    videoEditionCreate(input: $input) {
      id
      name
    }
  }
`)

export type CreateVideoEditionVariables = VariablesOf<
  typeof CREATE_VIDEO_EDITION
>
export type CreateVideoEdition = ResultOf<typeof CREATE_VIDEO_EDITION>

export function useCreateEditionMutation(
  options?: MutationHookOptions<CreateVideoEdition, CreateVideoEditionVariables>
): MutationTuple<CreateVideoEdition, CreateVideoEditionVariables> {
  const mutation = useMutation(CREATE_VIDEO_EDITION, options)

  return mutation
}
