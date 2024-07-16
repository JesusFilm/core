import {
  MutationFunctionOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import { BLOCK_UPDATE_ACTION_FIELDS } from '@core/journeys/ui/action/actionFields'

import {
  EmailActionUpdate,
  EmailActionUpdateVariables
} from '../../../__generated__/EmailActionUpdate'

export const EMAIL_ACTION_UPDATE = gql`
  ${BLOCK_UPDATE_ACTION_FIELDS}
  mutation EmailActionUpdate(
    $id: ID!
    $input: EmailActionInput!
  ) {
    blockUpdateEmailAction(id: $id, input: $input) {
      parentBlockId
      parentBlock {
        id
        ...BlockUpdateActionFields
      }
    }
  }
`

export function useBlockActionEmailUpdateMutation(
  options?: MutationFunctionOptions<
    EmailActionUpdate,
    EmailActionUpdateVariables
  >
): MutationTuple<EmailActionUpdate, EmailActionUpdateVariables> {
  return useMutation<EmailActionUpdate, EmailActionUpdateVariables>(
    EMAIL_ACTION_UPDATE,
    options
  )
}
