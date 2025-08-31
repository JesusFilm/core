'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { graphql } from '@core/shared/gql'
import { Dialog } from '@core/shared/ui/Dialog'

import { DEFAULT_VIDEO_LANGUAGE_ID } from '../../../../constants'

// Intentionally avoid explicit PageProps typing to satisfy Next.js constraints

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

export default function DeleteAudio(props: unknown): ReactElement {
  const { videoId, variantId } = (props as { params: { videoId: string; variantId: string } }).params
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
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
