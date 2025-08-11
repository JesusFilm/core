'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement, useCallback, useMemo, useState } from 'react'

import { graphql } from '@core/shared/gql'
import { Dialog } from '@core/shared/ui/Dialog'

interface PublishAllChildrenDialogProps {
  params: {
    videoId: string
  }
}

const GET_VIDEO_CHILDREN_FOR_PUBLISH = graphql(`
  query GetVideoChildrenForPublish($id: ID!) {
    adminVideo(id: $id) {
      id
      children {
        id
        published
        variants(input: { onlyPublished: false }) {
          id
          published
        }
      }
    }
  }
`)

const UPDATE_VIDEO = graphql(`
  mutation UpdateVideo($input: VideoUpdateInput!) {
    videoUpdate(input: $input) {
      id
      published
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

export default function PublishAllChildrenDialog({
  params: { videoId }
}: PublishAllChildrenDialogProps): ReactElement {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data } = useSuspenseQuery(GET_VIDEO_CHILDREN_FOR_PUBLISH, {
    variables: { id: videoId }
  })

  const [updateVideo] = useMutation(UPDATE_VIDEO)
  const [updateVariant] = useMutation(UPDATE_VIDEO_VARIANT)

  const { unpublishedChildren, allUnpublishedVariants } = useMemo(() => {
    const children = data?.adminVideo?.children ?? []
    const unpublished = children.filter((child) => !child.published)
    const unpublishedVariants = children.flatMap(
      (child) => child.variants?.filter((v) => !v.published) ?? []
    )
    return {
      unpublishedChildren: unpublished,
      allUnpublishedVariants: unpublishedVariants
    }
  }, [data?.adminVideo?.children])

  if ((unpublishedChildren?.length ?? 0) === 0) {
    enqueueSnackbar('No unpublished children to publish', { variant: 'info' })
    router.push(`/videos/${videoId}`, { scroll: false })
    return <></>
  }

  const handleClose = useCallback(() => {
    router.push(`/videos/${videoId}`, { scroll: false })
  }, [router, videoId])

  const handlePublishChildren = useCallback(async () => {
    if (unpublishedChildren.length === 0) {
      handleClose()
      return
    }
    setIsSubmitting(true)
    const results = await Promise.all([
      // Also publish the parent video
      updateVideo({ variables: { input: { id: videoId, published: true } } }),
      // Publish all children
      ...unpublishedChildren.map((child) =>
        updateVideo({
          variables: { input: { id: child.id, published: true } }
        })
      )
    ])

    const hasErrors = results.some((r) => r.errors != null)
    if (hasErrors) {
      enqueueSnackbar('Failed to publish children', { variant: 'error' })
      setIsSubmitting(false)
      return
    }

    enqueueSnackbar(
      `Successfully published ${unpublishedChildren.length} children`,
      { variant: 'success' }
    )
    setIsSubmitting(false)
    router.refresh()
    handleClose()
  }, [enqueueSnackbar, handleClose, router, unpublishedChildren, updateVideo])

  const handlePublishChildrenAndLanguages = useCallback(async () => {
    if (unpublishedChildren.length === 0) {
      handleClose()
      return
    }
    setIsSubmitting(true)

    const childrenResults = await Promise.all([
      // Also publish the parent video
      updateVideo({ variables: { input: { id: videoId, published: true } } }),
      // Publish all children
      ...unpublishedChildren.map((child) =>
        updateVideo({
          variables: { input: { id: child.id, published: true } }
        })
      )
    ])
    const childrenHasErrors = childrenResults.some((r) => r.errors != null)

    let variantsHasErrors = false
    if (allUnpublishedVariants.length > 0) {
      const variantResults = await Promise.all(
        allUnpublishedVariants.map((variant) =>
          updateVariant({
            variables: { input: { id: variant.id, published: true } }
          })
        )
      )
      variantsHasErrors = variantResults.some((r) => r.errors != null)
    }

    if (childrenHasErrors || variantsHasErrors) {
      enqueueSnackbar('Failed to publish children and languages', {
        variant: 'error'
      })
      setIsSubmitting(false)
      return
    }

    enqueueSnackbar(
      `Successfully published ${unpublishedChildren.length} children and ${allUnpublishedVariants.length} languages`,
      { variant: 'success' }
    )
    setIsSubmitting(false)
    router.refresh()
    handleClose()
  }, [
    allUnpublishedVariants,
    enqueueSnackbar,
    handleClose,
    router,
    unpublishedChildren,
    updateVariant,
    updateVideo
  ])

  return (
    <Dialog
      open={true}
      onClose={handleClose}
      dialogTitle={{ title: 'Publish All Children', closeButton: true }}
      divider
      loading={isSubmitting}
    >
      <Stack spacing={2} sx={{ mt: 1 }}>
        <Typography variant="body1">
          Choose how you would like to publish the children of this video:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • <strong>Publish Children Only:</strong> Publishes this video and{' '}
          {unpublishedChildren.length} unpublished children
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • <strong>Publish Children + Languages:</strong> Publishes this video,
          its children, and all their languages
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This will make them publicly available and cannot be easily undone.
        </Typography>

        <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
          <Button onClick={handleClose} color="primary" variant="text">
            Cancel
          </Button>
          <Button
            onClick={handlePublishChildren}
            color="primary"
            variant="outlined"
            disabled={isSubmitting}
          >
            Publish Children Only
          </Button>
          <Button
            onClick={handlePublishChildrenAndLanguages}
            color="primary"
            variant="contained"
            disabled={isSubmitting}
            autoFocus
          >
            Publish Children + Languages
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  )
}
