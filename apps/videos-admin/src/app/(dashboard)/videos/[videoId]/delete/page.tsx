'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { useTranslation } from 'next-i18next'

import { graphql } from '@core/shared/gql'
import { Dialog } from '@core/shared/ui/Dialog'

import { DEFAULT_VIDEO_LANGUAGE_ID } from '../../constants'

interface DeleteVideoPageProps {
  params: {
    videoId: string
  }
}

const GET_VIDEO_FOR_DELETE = graphql(`
  query GetVideoForDelete($id: ID!, $languageId: ID!) {
    adminVideo(id: $id) {
      id
      published
      publishedAt
      title(languageId: $languageId) {
        id
        value
      }
    }
  }
`)

const DELETE_VIDEO = graphql(`
  mutation DeleteVideo($id: ID!) {
    videoDelete(id: $id) {
      id
    }
  }
`)

export default function DeleteVideoPage({
  params: { videoId }
}: DeleteVideoPageProps): ReactElement {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const { data } = useSuspenseQuery(GET_VIDEO_FOR_DELETE, {
    variables: { id: videoId, languageId: DEFAULT_VIDEO_LANGUAGE_ID }
  })
  const [deleteVideo, { loading }] = useMutation(DELETE_VIDEO, {
    onCompleted: () => {
      enqueueSnackbar(t('Video deleted successfully'), { variant: 'success' })
      router.push('/videos', { scroll: false })
    },
    onError: (error) => {
      enqueueSnackbar(error.message || t('Failed to delete video'), {
        variant: 'error'
      })
    }
  })

  const { t } = useTranslation('apps-videos-admin')

  // Handle video not found
  if (!data.adminVideo) {
    enqueueSnackbar(t('Video not found'), { variant: 'error' })
    router.push('/videos', { scroll: false })
    return <div>{t('Redirecting...')}</div>
  }

  // Check if video can be deleted (never been published)
  if (data.adminVideo.publishedAt !== null) {
    enqueueSnackbar(t('Cannot delete a video that has been published'), {
      variant: 'error'
    })
    router.push(`/videos/${videoId}`, { scroll: false })
    return <div>{t('Redirecting...')}</div>
  }

  const handleDeleteVideo = async (): Promise<void> => {
    await deleteVideo({
      variables: { id: videoId },
      update: (cache) => {
        // Invalidate all adminVideos and adminVideosCount queries in the cache
        cache.evict({ fieldName: 'adminVideos' })
        cache.evict({ fieldName: 'adminVideosCount' })
        cache.gc()
      }
    })
  }

  const videoTitle =
    data.adminVideo.title?.find((t) => t.value)?.value || t('Untitled Video')

  return (
    <Dialog
      open={true}
      onClose={() => router.push(`/videos/${videoId}`, { scroll: false })}
      dialogTitle={{
        title: t('Delete Video'),
        closeButton: true
      }}
      dialogAction={{
        onSubmit: handleDeleteVideo,
        submitLabel: t('Delete'),
        closeLabel: t('Cancel')
      }}
      loading={loading}
    >
      {t(
        `Are you sure you want to delete "${videoTitle}"? This action cannot be undone and will permanently remove the video and all its associated data.`
      )}
    </Dialog>
  )
}
