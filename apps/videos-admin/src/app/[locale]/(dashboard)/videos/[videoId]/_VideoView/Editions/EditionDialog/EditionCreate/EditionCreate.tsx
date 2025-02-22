import { gql, useMutation } from '@apollo/client'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { useVideo } from '../../../../../../../../../libs/VideoProvider'
import { EditionForm, EditionValidationSchema } from '../../EditionForm'

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

interface EditionCreateProps {
  close: () => void
}

export function EditionCreate({ close }: EditionCreateProps): ReactElement {
  const t = useTranslations()
  const { enqueueSnackbar } = useSnackbar()
  const video = useVideo()

  const [createEdition] = useMutation(CREATE_VIDEO_EDITION, {
    update(cache, { data }) {
      if (data?.videoEditionCreate == null) return

      cache.modify({
        id: cache.identify(video),
        fields: {
          videoEditions(existingData) {
            const newVideoEditionRef = cache.writeFragment({
              data: data.videoEditionCreate,
              fragment: gql`
                fragment NewVideoEdition on VideoEdition {
                  id
                  name
                }
              `
            })

            return [...existingData, newVideoEditionRef]
          }
        }
      })
    }
  })

  const handleSubmit = async (values: EditionValidationSchema) => {
    await createEdition({
      variables: {
        input: {
          videoId: video.id,
          name: values.name
        }
      },
      onCompleted: () => {
        enqueueSnackbar(t('Successfully created edition.'), {
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
      variant="create"
      initialValues={{ name: '' }}
      onSubmit={handleSubmit}
    />
  )
}
