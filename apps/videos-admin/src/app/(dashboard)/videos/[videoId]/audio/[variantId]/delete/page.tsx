'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'

import { graphql } from '@core/shared/gql'
import { Dialog } from '@core/shared/ui/Dialog'

import { DEFAULT_VIDEO_LANGUAGE_ID } from '../../../../constants'

type DeleteAudioParams = {
  params: {
    videoId: string
    variantId: string
  }
}

const GET_ADMIN_VIDEO_VARIANT_DELETE = graphql(`
  query GetAdminVideoVariant($id: ID!, $languageId: ID) {
    videoVariant(id: $id) {
      id
      language {
        name(languageId: $languageId) {
          value
        }
      }
    }
  }
`)

const DELETE_VIDEO_VARIANT = graphql(`
  mutation DeleteVideoVariant($id: ID!) {
    videoVariantDelete(id: $id) {
      id
    }
  }
`)

export default function DeleteAudio({
  params: { videoId, variantId }
}: DeleteAudioParams) {
  const router = useRouter()
  const { data } = useSuspenseQuery(GET_ADMIN_VIDEO_VARIANT_DELETE, {
    variables: { id: variantId, languageId: DEFAULT_VIDEO_LANGUAGE_ID }
  })
  const returnUrl = `/videos/${videoId}/audio`
  const [deleteVideoVariant, { loading }] = useMutation(DELETE_VIDEO_VARIANT, {
    variables: {
      id: variantId
    },
    onCompleted: () => {
      enqueueSnackbar('Audio language deleted successfully', {
        variant: 'success'
      })
      router.push(returnUrl, {
        scroll: false
      })
    }
  })

  return (
    <Dialog
      open={true}
      onClose={() =>
        router.push(returnUrl, {
          scroll: false
        })
      }
      dialogTitle={{
        title: 'Delete Audio Language',
        closeButton: true
      }}
      dialogAction={{
        onSubmit: deleteVideoVariant,
        submitLabel: 'Delete',
        closeLabel: 'Cancel'
      }}
      loading={loading}
    >
      {`Are you sure you want to delete the ${data.videoVariant.language.name[0].value} audio language? This action cannot be undone.`}
    </Dialog>
  )
}
