'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement, use, useCallback, useMemo, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { PublishAllDialogBody } from './_PublishAllChildren/PublishAllDialogBody'
import {
  GET_VIDEO_CHILDREN_FOR_PUBLISH,
  PUBLISH_CHILDREN
} from './_PublishAllChildren/publishAll.documents'
import type {
  PublishSummaryEntry,
  VideoPublishMode
} from './_PublishAllChildren/publishAll.types'

interface PublishAllChildrenDialogProps {
  params: Promise<{ videoId: string }> | { videoId: string }
}

export default function PublishAllChildrenDialog({
  params
}: PublishAllChildrenDialogProps): ReactElement {
  const { videoId } =
    (params as any)?.then != null ? use(params as any) : (params as any)
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [latestResult, setLatestResult] = useState<PublishSummaryEntry | null>(
    null
  )

  const { data } = useSuspenseQuery(GET_VIDEO_CHILDREN_FOR_PUBLISH, {
    variables: { id: videoId }
  })

  const [publishChildren] = useMutation(PUBLISH_CHILDREN)

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

  const replaceLatestResult = useCallback((entry: PublishSummaryEntry) => {
    setLatestResult(entry)
  }, [])

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
      const { data: mutationData, errors } = await publishChildren({
        variables: {
          id: videoId,
          mode: 'childrenVideosOnly',
          dryRun: false
        }
      })
      if (errors != null && errors.length > 0) {
        throw new Error('Failed to publish children')
      }
      const result = mutationData?.videoPublishChildren
      if (result == null) {
        throw new Error('No publish result')
      }
      replaceLatestResult({
        dryRun: false,
        publishedVideoIds: result.publishedVideoIds ?? [],
        publishedVariantIds: result.publishedVariantIds ?? [],
        videosFailedValidation: result.videosFailedValidation ?? []
      })
      const failures = result.videosFailedValidation ?? []
      if (failures.length > 0) {
        enqueueSnackbar(
          `${failures.length} video(s) could not be published. Fix issues using the links below, then try again.`,
          { variant: 'warning' }
        )
        setIsSubmitting(false)
        router.refresh()
        return
      }
      enqueueSnackbar(
        `Successfully published ${result.publishedVideoCount} videos`,
        { variant: 'success' }
      )
      router.refresh()
      handleClose()
    } catch {
      enqueueSnackbar('Failed to publish children', { variant: 'error' })
      setIsSubmitting(false)
    }
  }, [
    replaceLatestResult,
    enqueueSnackbar,
    handleClose,
    publishChildren,
    router,
    unpublishedChildren.length,
    videoId
  ])

  const handleDryRun = useCallback(
    async (mode: VideoPublishMode) => {
      setIsSubmitting(true)
      try {
        const { data: mutationData, errors } = await publishChildren({
          variables: {
            id: videoId,
            mode,
            dryRun: true
          }
        })
        if (errors != null && errors.length > 0) {
          throw new Error('Failed to run dry run')
        }
        const result = mutationData?.videoPublishChildren
        if (result == null) {
          throw new Error('No dry run result')
        }
        replaceLatestResult({
          dryRun: true,
          publishedVideoIds: result.publishedVideoIds ?? [],
          publishedVariantIds: result.publishedVariantIds ?? [],
          videosFailedValidation: result.videosFailedValidation ?? []
        })
      } catch {
        enqueueSnackbar('Failed to run dry run', { variant: 'error' })
      } finally {
        setIsSubmitting(false)
      }
    },
    [replaceLatestResult, enqueueSnackbar, publishChildren, videoId]
  )

  const handlePublishChildrenAndLanguages = useCallback(async () => {
    if (unpublishedChildren.length === 0) {
      handleClose()
      return
    }
    setIsSubmitting(true)
    try {
      const { data: mutationData, errors } = await publishChildren({
        variables: {
          id: videoId,
          mode: 'childrenVideosAndVariants',
          dryRun: false
        }
      })
      if (errors != null && errors.length > 0) {
        throw new Error('Failed to publish children and languages')
      }
      const result = mutationData?.videoPublishChildren
      if (result == null) {
        throw new Error('No publish result')
      }
      replaceLatestResult({
        dryRun: false,
        publishedVideoIds: result.publishedVideoIds ?? [],
        publishedVariantIds: result.publishedVariantIds ?? [],
        videosFailedValidation: result.videosFailedValidation ?? []
      })
      const failures = result.videosFailedValidation ?? []
      if (failures.length > 0) {
        enqueueSnackbar(
          `${failures.length} video(s) could not be published. Fix issues using the links below, then try again.`,
          { variant: 'warning' }
        )
        setIsSubmitting(false)
        router.refresh()
        return
      }
      enqueueSnackbar(
        `Successfully published ${result.publishedVideoCount} videos and ${result.publishedVariantsCount} audio language variant(s)`,
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
    replaceLatestResult,
    enqueueSnackbar,
    handleClose,
    publishChildren,
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
      <PublishAllDialogBody
        unpublishedChildrenCount={unpublishedChildren.length}
        allUnpublishedVariantsCount={allUnpublishedVariants.length}
        isSubmitting={isSubmitting}
        latestResult={latestResult}
        onPublishVideosOnly={handlePublishChildren}
        onDryRun={handleDryRun}
        onPublishVideosAndLanguages={handlePublishChildrenAndLanguages}
        onClose={handleClose}
      />
    </Dialog>
  )
}
