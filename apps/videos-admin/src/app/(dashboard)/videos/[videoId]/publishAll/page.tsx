'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement, use, useCallback, useMemo, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import {
  GET_VIDEO_CHILDREN_FOR_PUBLISH,
  PUBLISH_CHILDREN
} from './_PublishAllChildren/publishAll.documents'
import type {
  PublishSummaryEntry,
  VideoPublishMode
} from './_PublishAllChildren/publishAll.types'
import { PublishAllDialogBody } from './_PublishAllChildren/PublishAllDialogBody'

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
  const [pendingPartialPublishMode, setPendingPartialPublishMode] =
    useState<VideoPublishMode | null>(null)

  const { data } = useSuspenseQuery(GET_VIDEO_CHILDREN_FOR_PUBLISH, {
    variables: { id: videoId }
  })

  const [publishChildren] = useMutation(PUBLISH_CHILDREN)

  const { unpublishedChildren, allUnpublishedVariants } = useMemo(() => {
    const video = data?.adminVideo
    const children = video?.children ?? []
    const parentVariants = video?.variants ?? []
    const unpublished = children.filter((child) => !child.published)
    const unpublishedVariants = [
      ...parentVariants.filter((variant) => !variant.published),
      ...children.flatMap(
        (child) => child.variants?.filter((v) => !v.published) ?? []
      )
    ]
    return {
      unpublishedChildren: unpublished,
      allUnpublishedVariants: unpublishedVariants
    }
  }, [data?.adminVideo])

  const replaceLatestResult = useCallback((entry: PublishSummaryEntry) => {
    setLatestResult(entry)
  }, [])

  const handleClose = useCallback(() => {
    router.push(`/videos/${videoId}`, { scroll: false })
  }, [router, videoId])

  const resultToSummaryEntry = useCallback(
    (
      result: NonNullable<
        Awaited<ReturnType<typeof publishChildren>>['data']
      >['videoPublishChildren']
    ): PublishSummaryEntry => ({
      dryRun: result.dryRun === true,
      publishedVideoIds: result.publishedVideoIds ?? [],
      publishedVariantIds: result.publishedVariantIds ?? [],
      videosFailedValidation: result.videosFailedValidation ?? []
    }),
    []
  )

  const runPublishMutation = useCallback(
    async (mode: VideoPublishMode, dryRun: boolean) => {
      const { data: mutationData, errors } = await publishChildren({
        variables: {
          id: videoId,
          mode,
          dryRun
        }
      })
      if (errors != null && errors.length > 0) {
        throw new Error('Failed to publish')
      }
      const result = mutationData?.videoPublishChildren
      if (result == null) {
        throw new Error('No publish result')
      }
      return result
    },
    [publishChildren, videoId]
  )

  const executePublish = useCallback(
    async (mode: VideoPublishMode) => {
      setIsSubmitting(true)
      try {
        const result = await runPublishMutation(mode, false)
        replaceLatestResult(resultToSummaryEntry(result))

        enqueueSnackbar(
          mode === 'childrenVideosOnly'
            ? `Successfully published ${result.publishedVideoCount} videos`
            : `Successfully published ${result.publishedVideoCount} videos and ${result.publishedVariantsCount} audio language variant(s)`,
          { variant: 'success' }
        )
        router.refresh()
        handleClose()
      } catch {
        enqueueSnackbar(
          mode === 'childrenVideosOnly'
            ? 'Failed to publish children'
            : 'Failed to publish children and languages',
          { variant: 'error' }
        )
        setIsSubmitting(false)
      }
    },
    [
      enqueueSnackbar,
      handleClose,
      replaceLatestResult,
      resultToSummaryEntry,
      router,
      runPublishMutation
    ]
  )

  const requestPublish = useCallback(
    async (mode: VideoPublishMode) => {
      setIsSubmitting(true)
      try {
        const dryRunResult = await runPublishMutation(mode, true)
        replaceLatestResult(resultToSummaryEntry(dryRunResult))

        const failures = dryRunResult.videosFailedValidation ?? []
        const publishableCount =
          (dryRunResult.publishedVideoIds?.length ?? 0) +
          (dryRunResult.publishedVariantIds?.length ?? 0)

        if (failures.length > 0) {
          if (publishableCount > 0) {
            setPendingPartialPublishMode(mode)
          } else {
            enqueueSnackbar(
              `${failures.length} video(s) could not be published. Fix issues using the links below, then try again.`,
              { variant: 'warning' }
            )
          }
          setIsSubmitting(false)
          return
        }

        await executePublish(mode)
      } catch {
        enqueueSnackbar(
          mode === 'childrenVideosOnly'
            ? 'Failed to publish children'
            : 'Failed to publish children and languages',
          { variant: 'error' }
        )
        setIsSubmitting(false)
      }
    },
    [
      enqueueSnackbar,
      executePublish,
      replaceLatestResult,
      resultToSummaryEntry,
      runPublishMutation
    ]
  )

  const handlePublishChildren = useCallback(() => {
    void requestPublish('childrenVideosOnly')
  }, [requestPublish])

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

  const handlePublishChildrenAndLanguages = useCallback(() => {
    void requestPublish('childrenVideosAndVariants')
  }, [requestPublish])

  const handleConfirmPartialPublish = useCallback(() => {
    if (pendingPartialPublishMode == null) {
      return
    }
    const mode = pendingPartialPublishMode
    setPendingPartialPublishMode(null)
    void executePublish(mode)
  }, [executePublish, pendingPartialPublishMode])

  const handleCancelPartialPublish = useCallback(() => {
    setPendingPartialPublishMode(null)
  }, [])

  return (
    <>
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
      <Dialog
        open={pendingPartialPublishMode != null}
        onClose={handleCancelPartialPublish}
        dialogTitle={{ title: 'Publish Valid Videos?', closeButton: true }}
        dialogAction={{
          onSubmit: handleConfirmPartialPublish,
          submitLabel: 'Publish Valid Videos',
          closeLabel: 'Cancel'
        }}
        loading={isSubmitting}
      >
        <Typography variant="body1">
          Some videos cannot be published yet. Publish the valid videos and
          audio languages listed in the dry run anyway?
        </Typography>
      </Dialog>
    </>
  )
}
