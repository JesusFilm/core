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

const PUBLISH_VIDEO_VARIANTS_ONLY = graphql(`
  mutation PublishVideoVariantsOnly(
    $id: ID!
    $mode: VideoPublishMode!
    $dryRun: Boolean!
  ) {
    videoPublishChildren(id: $id, mode: $mode, dryRun: $dryRun) {
      publishedVariantsCount
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

  const [publishVariantsOnly] = useMutation(PUBLISH_VIDEO_VARIANTS_ONLY)

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
      const { data: mutationData, errors } = await publishVariantsOnly({
        variables: {
          id: videoId,
          mode: 'variantsOnly',
          dryRun: false
        }
      })
      if (errors != null && errors.length > 0) {
        throw new Error('Failed to publish variants')
      }
      const count =
        mutationData?.videoPublishChildren.publishedVariantsCount ??
        draftVariants.length
      enqueueSnackbar(
        `Successfully published ${count} draft audio language variant(s)`,
        { variant: 'success' }
      )
      router.refresh()
      handleClose()
    } catch {
      enqueueSnackbar('Failed to publish audio languages', { variant: 'error' })
      setIsSubmitting(false)
    }
  }, [
    draftVariants.length,
    enqueueSnackbar,
    handleClose,
    publishVariantsOnly,
    router,
    videoId
  ])

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
