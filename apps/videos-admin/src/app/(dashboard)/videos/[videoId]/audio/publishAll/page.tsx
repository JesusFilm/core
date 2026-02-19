'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement, use, useCallback, useMemo, useState } from 'react'

import { graphql } from '@core/shared/gql'
import { Dialog } from '@core/shared/ui/Dialog'

interface PublishAllAudioDialogProps {
  params: Promise<{ videoId: string }> | { videoId: string }
}

const GET_ADMIN_VIDEO_VARIANTS = graphql(`
  query GetAdminVideoVariantsForPublishAll($id: ID!) {
    adminVideo(id: $id) {
      id
      variants(input: { onlyPublished: false }) {
        id
        published
      }
    }
  }
`)

const UPDATE_VIDEO_VARIANT = graphql(`
  mutation UpdateVideoVariant($input: VideoVariantUpdateInput!) {
    videoVariantUpdate(input: $input) {
      id
      published
    }
  }
`)

export default function PublishAllAudioDialog({
  params
}: PublishAllAudioDialogProps): ReactElement {
  const { videoId } =
    (params as any)?.then != null ? use(params as any) : (params as any)
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data } = useSuspenseQuery(GET_ADMIN_VIDEO_VARIANTS, {
    variables: { id: videoId }
  })

  const [updateVariant] = useMutation(UPDATE_VIDEO_VARIANT)

  const draftVariants = useMemo(() => {
    return (
      data?.adminVideo?.variants?.filter((variant) => !variant.published) ?? []
    )
  }, [data?.adminVideo?.variants])

  if (draftVariants.length === 0) {
    enqueueSnackbar('No draft audio languages to publish', { variant: 'info' })
    router.push(`/videos/${videoId}/audio`, { scroll: false })
    return <></>
  }

  const handleClose = useCallback(() => {
    router.push(`/videos/${videoId}/audio`, { scroll: false })
  }, [router, videoId])

  const handleConfirmPublishAll = useCallback(async () => {
    setIsSubmitting(true)
    try {
      await Promise.all(
        draftVariants.map((variant) =>
          updateVariant({
            variables: { input: { id: variant.id, published: true } }
          })
        )
      )
      enqueueSnackbar('Successfully published all draft audio languages', {
        variant: 'success'
      })
      router.refresh()
      handleClose()
    } catch {
      enqueueSnackbar('Failed to publish audio languages', { variant: 'error' })
      setIsSubmitting(false)
    }
  }, [draftVariants, enqueueSnackbar, handleClose, router, updateVariant])

  return (
    <Dialog
      open={true}
      onClose={handleClose}
      dialogTitle={{
        title: 'Publish All Draft Audio Languages',
        closeButton: true
      }}
      divider
      loading={isSubmitting}
    >
      <Stack spacing={2} sx={{ mt: 1 }}>
        <Typography variant="body1">
          Are you sure you want to publish all draft audio language variants?
          This will make them publicly available and cannot be easily undone.
        </Typography>

        <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
          <Button onClick={handleClose} color="primary" variant="text">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmPublishAll}
            color="primary"
            variant="contained"
            disabled={isSubmitting}
            autoFocus
          >
            Publish All
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  )
}
