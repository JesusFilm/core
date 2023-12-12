import { gql, useMutation } from '@apollo/client'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { FormBlockUpdateCredentials } from '../../../../../../../../../__generated__/FormBlockUpdateCredentials'
import { TextFieldForm } from '../../../../../../../TextFieldForm'

export const FORM_BLOCK_UPDATE = gql`
  mutation FormBlockUpdateCredentials($id: ID!, $input: FormBlockUpdateInput!) {
    formBlockUpdate(id: $id, input: $input) {
      id
      form
      projects {
        id
        name
      }
      forms {
        slug
        name
      }
      projectId
      formSlug
    }
  }
`

interface ApiTokenTextFieldProps {
  id?: string
}

export function ApiTokenTextField({
  id
}: ApiTokenTextFieldProps): ReactElement {
  const [formBlockUpdateCredentials] =
    useMutation<FormBlockUpdateCredentials>(FORM_BLOCK_UPDATE)
  const { enqueueSnackbar } = useSnackbar()

  const placeHolderToken =
    'thisIsAFakeApiTokenTheReaOneIsNeverShowAgainInTheFrontEnd'

  async function handleSubmitApiToken(apiToken: string): Promise<void> {
    if (id == null || apiToken === placeHolderToken) return
    try {
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
      enqueueSnackbar('API Token updated', {
        variant: 'success',
        preventDuplicate: true
      })
    } catch (e) {
      enqueueSnackbar(e.message, {
        variant: 'error',
        preventDuplicate: true
      })
    }
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
