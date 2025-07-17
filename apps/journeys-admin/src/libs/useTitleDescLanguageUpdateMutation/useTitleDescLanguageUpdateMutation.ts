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
      updatedAt
    }
  }
`

/**
 * useTitleDescLanguageUpdateMutation is a custom hook that provides a mutation function for updating the title, description, and language of a journey.
 * It uses the TITLE_DESC_LANGUAGE_UPDATE mutation from the Apollo Client.
 *
 * @param {MutationHookOptions<TitleDescLanguageUpdate, TitleDescLanguageUpdateVariables>} [options] - Optional mutation options
 * @returns {MutationTuple<TitleDescLanguageUpdate, TitleDescLanguageUpdateVariables>} A tuple containing the mutation function and loading state
 */
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
