import { gql } from '@apollo/client'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { useCreateEditionMutation } from '../../../../../../../../libs/useCreateEdition'
import { useVideo } from '../../../../../../../../libs/VideoProvider'
import { EditionForm, EditionValidationSchema } from '../../EditionForm'

interface EditionCreateProps {
  close: () => void
}

export function EditionCreate({ close }: EditionCreateProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const video = useVideo()

  const [createEdition] = useCreateEditionMutation({
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
        enqueueSnackbar('Successfully created edition.', {
          variant: 'success'
        })
        close()
      },
      onError: () => {
        enqueueSnackbar('Failed to create edition.', { variant: 'error' })
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
