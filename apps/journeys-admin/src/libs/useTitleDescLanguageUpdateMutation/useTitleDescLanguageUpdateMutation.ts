import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import {
  TitleDescLanguageUpdate,
  TitleDescLanguageUpdateVariables
} from '../../../__generated__/TitleDescLanguageUpdate'

export const TITLE_DESC_LANGUAGE_UPDATE = gql`
  mutation TitleDescLanguageUpdate($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
      title
      description
      language {
        id
        bcp47
        iso3
        name {
          value
          primary
        }
      }
    }
  }
`

export function useTitleDescLanguageUpdateMutation(
  options?: MutationHookOptions<
    TitleDescLanguageUpdate,
    TitleDescLanguageUpdateVariables
  >
): MutationTuple<TitleDescLanguageUpdate, TitleDescLanguageUpdateVariables> {
  const mutation = useMutation<
    TitleDescLanguageUpdate,
    TitleDescLanguageUpdateVariables
  >(TITLE_DESC_LANGUAGE_UPDATE, options)

  return mutation
}
