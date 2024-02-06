import { gql, useMutation } from '@apollo/client'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Lock1Icon from '@core/shared/ui/icons/Lock1'
import LockOpen1Icon from '@core/shared/ui/icons/LockOpen1'

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
      apiTokenExists
    }
  }
`

interface ApiTokenTextFieldProps {
  id?: string
  apiTokenExists: boolean
  loading: boolean
}

export const placeHolderToken =
  'thisIsAFakeApiTokenTheReaOneIsNeverShowAgainInTheFrontEnd!!!'

export function ApiTokenTextField({
  id,
  apiTokenExists,
  loading
}: ApiTokenTextFieldProps): ReactElement {
  const [formBlockUpdateCredentials] =
    useMutation<FormBlockUpdateCredentials>(FORM_BLOCK_UPDATE)
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')
  const [lockTextField, setLockTextField] = useState(true)
  const apiTokenTextFieldId = 'apiTokenTextFieldId'

  useEffect(() => {
    if (!lockTextField) {
      const input = document.getElementById(
        apiTokenTextFieldId
      ) as HTMLInputElement
      input?.focus()
      input?.select()
    }
  }, [lockTextField])

  useEffect(() => {
    if (!loading && !apiTokenExists) setLockTextField(false)
  }, [loading, apiTokenExists])

  const handleToggleLock = (): void => {
    setLockTextField((lock) => !lock)
  }

  async function handleSubmitApiToken(apiToken: string): Promise<void> {
    if (id == null || apiToken === placeHolderToken) return
    try {
      await formBlockUpdateCredentials({
        variables: {
          id,
          input: {
            apiToken: apiToken === '' ? null : apiToken
          }
        }
      })
      if (apiToken !== '') setLockTextField(true)
      enqueueSnackbar(t('API Token updated'), {
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
      id={apiTokenTextFieldId}
      label={t('Api Token')}
      disabled={lockTextField}
      type="password"
      initialValue={loading || !apiTokenExists ? '' : placeHolderToken}
      onSubmit={handleSubmitApiToken}
      startIcon={
        <InputAdornment position="start">
          <IconButton
            aria-label="toggle field lock"
            onClick={handleToggleLock}
            edge="start"
          >
            {lockTextField ? <Lock1Icon /> : <LockOpen1Icon />}
          </IconButton>
        </InputAdornment>
      }
    />
  )
}
