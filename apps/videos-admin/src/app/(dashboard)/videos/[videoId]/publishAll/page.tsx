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

interface PublishAllChildrenDialogProps {
  params: Promise<{ videoId: string }> | { videoId: string }
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

const PUBLISH_CHILDREN = graphql(`
  mutation VideoPublishChildren($id: ID!) {
    videoPublishChildren(id: $id) {
      publishedChildrenCount
    }
  }
`)

const PUBLISH_CHILDREN_AND_LANGUAGES = graphql(`
  mutation VideoPublishChildrenAndLanguages($id: ID!) {
    videoPublishChildrenAndLanguages(id: $id) {
      publishedChildrenCount
      publishedVariantsCount
    }
  }
`)

export default function PublishAllChildrenDialog({
  params
}: PublishAllChildrenDialogProps): ReactElement {
  const { videoId } =
    (params as any)?.then != null ? use(params as any) : (params as any)
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data } = useSuspenseQuery(GET_VIDEO_CHILDREN_FOR_PUBLISH, {
    variables: { id: videoId }
  })

  const [publishChildren] = useMutation(PUBLISH_CHILDREN)
  const [publishChildrenAndLanguages] = useMutation(
    PUBLISH_CHILDREN_AND_LANGUAGES
  )

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
    try {
      const { data, errors } = await publishChildren({
        variables: { id: videoId }
      })
      if (errors != null && errors.length > 0) {
        throw new Error('Failed to publish children')
      }
      const count =
        data?.videoPublishChildren.publishedChildrenCount ??
        unpublishedChildren.length
      enqueueSnackbar(`Successfully published ${count} children`, {
        variant: 'success'
      })
      router.refresh()
      handleClose()
    } catch {
      enqueueSnackbar('Failed to publish children', { variant: 'error' })
      setIsSubmitting(false)
    }
  }, [
    enqueueSnackbar,
    handleClose,
    publishChildren,
    router,
    unpublishedChildren.length,
    videoId
  ])

  const handlePublishChildrenAndLanguages = useCallback(async () => {
    if (unpublishedChildren.length === 0) {
      handleClose()
      return
    }
    setIsSubmitting(true)
    try {
      const { data, errors } = await publishChildrenAndLanguages({
        variables: { id: videoId }
      })
      if (errors != null && errors.length > 0) {
        throw new Error('Failed to publish children and languages')
      }
      const publishedChildrenCount =
        data?.videoPublishChildrenAndLanguages.publishedChildrenCount ??
        unpublishedChildren.length
      const publishedVariantsCount =
        data?.videoPublishChildrenAndLanguages.publishedVariantsCount ??
        allUnpublishedVariants.length
      enqueueSnackbar(
        `Successfully published ${publishedChildrenCount} children and ${publishedVariantsCount} languages`,
        { variant: 'success' }
      )
      router.refresh()
      handleClose()
    } catch {
      enqueueSnackbar('Failed to publish children and languages', {
        variant: 'error'
      })
      setIsSubmitting(false)
    }
  }, [
    allUnpublishedVariants.length,
    enqueueSnackbar,
    handleClose,
    publishChildrenAndLanguages,
    router,
    unpublishedChildren.length,
    videoId
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
