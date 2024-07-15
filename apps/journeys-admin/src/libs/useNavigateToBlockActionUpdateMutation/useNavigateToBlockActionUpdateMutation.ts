import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import { BLOCK_UPDATE_ACTION_FIELDS } from '@core/journeys/ui/action/actionFields'
import {
  NavigateToBlockActionUpdate,
  NavigateToBlockActionUpdateVariables
} from '../../../__generated__/NavigateToBlockActionUpdate'

export const NAVIGATE_TO_BLOCK_ACTION_UPDATE = gql`
  ${BLOCK_UPDATE_ACTION_FIELDS}
  mutation NavigateToBlockActionUpdate(
    $id: ID!
    $journeyId: ID!
    $input: NavigateToBlockActionInput!
  ) {
    blockUpdateNavigateToBlockAction(
      id: $id
      journeyId: $journeyId
      input: $input
    ) {
      parentBlockId
      parentBlock {
        id
        ...BlockUpdateActionFields
      }
    }
  }
`

export function useNavigateToBlockActionUpdateMutation(
  options?: MutationHookOptions<
    NavigateToBlockActionUpdate,
    NavigateToBlockActionUpdateVariables
  >
): MutationTuple<
  NavigateToBlockActionUpdate,
  NavigateToBlockActionUpdateVariables
> {
  return useMutation<
    NavigateToBlockActionUpdate,
    NavigateToBlockActionUpdateVariables
  >(NAVIGATE_TO_BLOCK_ACTION_UPDATE, options)
}
