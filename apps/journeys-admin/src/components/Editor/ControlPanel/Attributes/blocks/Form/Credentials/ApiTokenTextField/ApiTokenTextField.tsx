import { gql, useMutation } from '@apollo/client'
import { ReactElement } from 'react'

import { FormBlockUpdateCredentials } from '../../../../../../../../../__generated__/FormBlockUpdateCredentials'
import { TextFieldForm } from '../../../../../../../TextFieldForm'
// import { FORM_BLOCK_UPDATE } from '../../Form'

export const FORM_BLOCK_UPDATE = gql`
  mutation FormBlockUpdateCredentials($id: ID!, $input: FormBlockUpdateInput!) {
    formBlockUpdate(id: $id, input: $input) {
      id
      form
    }
  }
`

interface ApiTokenTextFieldProps {
  id?: string
}

// TODO: show blank field when there is no apiToken
export function ApiTokenTextField({
  id
}: ApiTokenTextFieldProps): ReactElement {
  const [formBlockUpdateCredentials] =
    useMutation<FormBlockUpdateCredentials>(FORM_BLOCK_UPDATE)

  const placeHolderToken =
    'thisIsAFakeApiTokenTheReaOneIsNeverShowAgainInTheFrontEnd'

  async function handleSubmitApiToken(apiToken: string): Promise<void> {
    if (id == null || id === placeHolderToken) return
    await formBlockUpdateCredentials({
      variables: {
        id,
        input: {
          apiToken: apiToken === '' ? null : apiToken
        }
      },
      update(cache, { data }) {
        if (data?.formBlockUpdate != null) {
          cache.modify({
            id: cache.identify({
              __typename: 'FormBlock',
              id
            }),
            fields: {
              action: () => data.formBlockUpdate
            }
          })
        }
      }
    })
  }
  return (
    <TextFieldForm
      id="apiToken"
      label="Api Token"
      type="password"
      initialValue={placeHolderToken}
      onSubmit={handleSubmitApiToken}
    />
  )
}
