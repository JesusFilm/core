import { useMutation } from '@apollo/client'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { GetAdminVideo_AdminVideo_VideoEdition as Edition } from '../../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { EditionForm, EditionValidationSchema } from '../../EditionForm'

export const UPDATE_VIDEO_EDITION = graphql(`
  mutation UpdateVideoEdition($input: VideoEditionUpdateInput!) {
    videoEditionUpdate(input: $input) {
      id
      name
    }
  }
`)

export type UpdateVideoEditionVariables = VariablesOf<
  typeof UPDATE_VIDEO_EDITION
>
export type UpdateVideoEdition = ResultOf<typeof UPDATE_VIDEO_EDITION>

interface EditionEditProps {
  edition: Edition
  close: () => void
}

export function EditionEdit({
  edition,
  close
}: EditionEditProps): ReactElement {
  const t = useTranslations()
  const { enqueueSnackbar } = useSnackbar()

  const [updateEdition] = useMutation(UPDATE_VIDEO_EDITION)

  const handleSubmit = async (values: EditionValidationSchema) => {
    await updateEdition({
      variables: {
        input: {
          id: edition.id,
          name: values.name
        }
      },
      onCompleted: () => {
        enqueueSnackbar(t('Edition updated successfully.'), {
          variant: 'success'
        })
        close()
      },
      onError: () => {
        enqueueSnackbar(t('Something went wrong.'), { variant: 'error' })
      }
    })
  }

  return (
    <EditionForm
      variant="edit"
      initialValues={{ name: edition?.name ?? '' }}
      onSubmit={handleSubmit}
    />
  )
}
