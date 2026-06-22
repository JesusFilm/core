'use client'

import { gql, useMutation, useQuery } from '@apollo/client'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import PublishIcon from '@mui/icons-material/Publish'
import ReplayIcon from '@mui/icons-material/Replay'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { graphql } from '@core/shared/gql'

import { PublishedChip } from '../../../../../components/PublishedChip'
import { DEFAULT_VIDEO_LANGUAGE_ID } from '../../constants'

const GET_ADMIN_VIDEO_VARIANTS = graphql(`
  query GetAdminVideoVariants($id: ID!, $languageId: ID) {
    adminVideo(id: $id) {
      id
      slug
      published
      variants(input: { onlyPublished: false }) {
        id
        published
        language {
          id
          slug
          name(languageId: $languageId) {
            value
          }
        }
      }
    }
  }
`)

const GET_VIDEO_VARIANT_UPLOADS = gql`
  query GetVideoVariantUploads($input: VideoVariantUploadsFilter, $limit: Int) {
    videoVariantUploads(input: $input, limit: $limit) {
      id
      source
      status
      videoId
      languageId
      edition
      originalFilename
      errorMessage
      muxVideoId
      videoVariantId
      updatedAt
      createdAt
    }
  }
`

const RESUME_VIDEO_VARIANT_UPLOAD = gql`
  mutation ResumeVideoVariantUpload(
    $id: ID!
    $downloadable: Boolean
    $maxResolution: MaxResolutionTier
  ) {
    videoVariantUploadResume(
      id: $id
      downloadable: $downloadable
      maxResolution: $maxResolution
    ) {
      id
      status
      errorMessage
      muxVideoId
      videoVariantId
      updatedAt
    }
  }
`

interface VideoVariantUploadRow {
  id: string
  source: string
  status: string
  videoId: string
  languageId: string
  edition: string
  originalFilename?: string | null
  errorMessage?: string | null
  muxVideoId?: string | null
  videoVariantId?: string | null
  updatedAt?: string | null
  createdAt?: string | null
}

const incompleteUploadStatuses = [
  'created',
  'r2Prepared',
  'r2Uploaded',
  'muxCreated',
  'muxReady',
  'failed'
]

const uploadStatusLabels: Record<string, string> = {
  created: 'Upload started',
  r2Prepared: 'R2 prepared',
  r2Uploaded: 'R2 uploaded',
  muxCreated: 'Mux created',
  muxReady: 'Mux ready',
  failed: 'Failed',
  variantCreated: 'Complete'
}

function getUploadStatusColor(status: string) {
  if (status === 'failed') return 'error'
  if (status === 'muxReady' || status === 'muxCreated') return 'info'
  return 'warning'
}

function canResumeUpload(status: string) {
  return status !== 'created' && status !== 'r2Prepared'
}

function getUnresumableUploadMessage(status: string) {
  if (status === 'created' || status === 'r2Prepared') {
    return 'This upload cannot be resumed because the browser file upload did not complete. Add this audio language again.'
  }

  return null
}
export default function ClientLayout({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { enqueueSnackbar } = useSnackbar()
  const [reloadOnPathChange, setReloadOnPathChange] = useState(false)
  const [resumingUploadId, setResumingUploadId] = useState<string | null>(null)
  const { videoId } = useParams<{ videoId: string }>()

  const { data, loading, refetch } = useQuery(GET_ADMIN_VIDEO_VARIANTS, {
    variables: { id: videoId, languageId: DEFAULT_VIDEO_LANGUAGE_ID }
  })

  const {
    data: uploadsData,
    refetch: refetchUploads,
    startPolling: startUploadPolling,
    stopPolling: stopUploadPolling
  } = useQuery(GET_VIDEO_VARIANT_UPLOADS, {
    variables: {
      input: { videoId, statuses: incompleteUploadStatuses },
      limit: 100
    },
    fetchPolicy: 'cache-and-network'
  })

  const [resumeVideoVariantUpload] = useMutation(RESUME_VIDEO_VARIANT_UPLOAD)

  const incompleteUploads = useMemo(
    () => (uploadsData?.videoVariantUploads ?? []) as VideoVariantUploadRow[],
    [uploadsData?.videoVariantUploads]
  )

  useEffect(() => {
    if (reloadOnPathChange) {
      void refetch()
      void refetchUploads()
    }
    setReloadOnPathChange(
      (pathname?.includes('add') ||
        pathname?.includes('delete') ||
        /\/audio\/[^/]+$/.test(pathname || '')) ??
        false
    )
  }, [pathname])

  useEffect(() => {
    if (incompleteUploads.length > 0 || resumingUploadId != null) {
      startUploadPolling(3000)
      return () => stopUploadPolling()
    }

    stopUploadPolling()
  }, [
    incompleteUploads.length,
    resumingUploadId,
    startUploadPolling,
    stopUploadPolling
  ])

  const completeResumedUpload = useCallback(() => {
    setResumingUploadId(null)
    enqueueSnackbar('Audio language restored', { variant: 'success' })
    void refetch()
    void refetchUploads()
  }, [enqueueSnackbar, refetch, refetchUploads])

  useEffect(() => {
    if (resumingUploadId == null) return

    const upload = incompleteUploads.find((row) => row.id === resumingUploadId)
    if (upload == null) {
      completeResumedUpload()
      return
    }

    if (upload.status === 'failed') {
      setResumingUploadId(null)
      enqueueSnackbar(upload.errorMessage ?? 'Video upload resume failed', {
        variant: 'error'
      })
    }
  }, [
    completeResumedUpload,
    enqueueSnackbar,
    resumingUploadId,
    incompleteUploads
  ])

  const handleAddAudioLanguage = useCallback((): void => {
    router.push(`/videos/${videoId}/audio/add`, {
      scroll: false
    })
  }, [router, videoId])

  const handleVariantClick = useCallback(
    (variantId: string): void => {
      router.push(`/videos/${videoId}/audio/${variantId}`, {
        scroll: false
      })
    },
    [router, videoId]
  )

  const handlePreviewClick = useCallback(
    (
      event: React.MouseEvent,
      videoSlug: string,
      languageSlug: string
    ): void => {
      event.stopPropagation()
      window.open(
        `${process.env.NEXT_PUBLIC_WATCH_URL ?? ''}/watch/${videoSlug}.html/${languageSlug}.html`,
        '_blank',
        'noopener,noreferrer'
      )
    },
    []
  )

  const handleDeleteClick = useCallback(
    (event: React.MouseEvent, variantId: string): void => {
      event.stopPropagation()
      router.push(`/videos/${videoId}/audio/${variantId}/delete`, {
        scroll: false
      })
    },
    [router, videoId]
  )

  const handlePublishAllClick = useCallback(() => {
    if (!data?.adminVideo.variants) return
    const draftVariants = data.adminVideo.variants.filter((v) => !v.published)
    if (draftVariants.length === 0) {
      enqueueSnackbar('No draft audio languages to publish', {
        variant: 'info'
      })
      return
    }
    router.push(`/videos/${videoId}/audio/publishAll`, { scroll: false })
  }, [data?.adminVideo.variants, enqueueSnackbar, router, videoId])

  const handleResumeUpload = useCallback(
    async (uploadId: string) => {
      setResumingUploadId(uploadId)
      try {
        const result = await resumeVideoVariantUpload({
          variables: {
            id: uploadId,
            downloadable: true,
            maxResolution: 'uhd'
          }
        })
        const upload = result.data?.videoVariantUploadResume

        if (upload?.status === 'variantCreated') {
          completeResumedUpload()
          return
        }

        if (upload?.status === 'failed') {
          setResumingUploadId(null)
          enqueueSnackbar(upload.errorMessage ?? 'Video upload resume failed', {
            variant: 'error'
          })
          return
        }

        await refetchUploads()
      } catch (error) {
        setResumingUploadId(null)
        enqueueSnackbar(
          error instanceof Error ? error.message : 'Video upload resume failed',
          { variant: 'error' }
        )
      }
    },
    [
      completeResumedUpload,
      enqueueSnackbar,
      refetchUploads,
      resumeVideoVariantUpload
    ]
  )

  const renderIncompleteUploadItems = () => {
    return incompleteUploads.map((upload) => {
      const isResuming = resumingUploadId === upload.id
      const statusLabel = uploadStatusLabels[upload.status] ?? upload.status
      const canResume = canResumeUpload(upload.status)
      const canReupload = !canResume
      const actionLabel = upload.status === 'failed' ? 'Retry' : 'Resume'
      const unresumableMessage = getUnresumableUploadMessage(upload.status)

      return (
        <ListItem
          key={upload.id}
          sx={{
            border: '1px solid',
            borderColor: 'warning.light',
            backgroundColor: 'background.default',
            borderRadius: 1,
            p: 1,
            mb: 1,
            minHeight: 66,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
              <Typography variant="body2" fontWeight={600}>
                Language {upload.languageId}
              </Typography>
              <Chip
                size="small"
                label={statusLabel}
                color={getUploadStatusColor(upload.status) as any}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {upload.edition} • {upload.source}
              {upload.originalFilename != null
                ? ` • ${upload.originalFilename}`
                : ''}
            </Typography>
            {unresumableMessage != null && (
              <Typography
                variant="caption"
                color="warning.main"
                sx={{ display: 'block' }}
              >
                {unresumableMessage}
              </Typography>
            )}
            {upload.errorMessage != null && (
              <Typography
                variant="caption"
                color="error.main"
                sx={{ display: 'block' }}
              >
                {upload.errorMessage}
              </Typography>
            )}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block' }}
            >
              Upload id: {upload.id}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            startIcon={
              isResuming ? undefined : canReupload ? (
                <AddIcon />
              ) : (
                <ReplayIcon />
              )
            }
            disabled={resumingUploadId != null}
            onClick={() => {
              if (canReupload) {
                handleAddAudioLanguage()
                return
              }

              void handleResumeUpload(upload.id)
            }}
          >
            {canReupload
              ? 'Add again'
              : isResuming
                ? 'Resuming...'
                : actionLabel}
          </Button>
        </ListItem>
      )
    })
  }

  const renderContent = () => {
    if (loading) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'calc(100% - 60px)',
            gap: 2
          }}
        >
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">
            Loading audio languages...
          </Typography>
        </Box>
      )
    }

    if (
      (!data?.adminVideo.variants || data.adminVideo.variants.length === 0) &&
      incompleteUploads.length === 0
    ) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'calc(100% - 60px)',
            gap: 2
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No audio languages found
          </Typography>
        </Box>
      )
    }

    return (
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          mt: 1
        }}
      >
        <List disablePadding>
          {renderIncompleteUploadItems()}
          {(data?.adminVideo.variants ?? []).map((variant) => {
            const canPreview =
              variant.published &&
              data?.adminVideo?.published &&
              data?.adminVideo?.slug &&
              variant.language?.slug

            return (
              <ListItem
                key={variant.id}
                onClick={() => handleVariantClick(variant.id)}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.default',
                  borderRadius: 1,
                  p: 1,
                  mb: 1,
                  '&:hover': {
                    cursor: 'pointer',
                    backgroundColor: 'action.hover'
                  },
                  transition: 'background-color 0.3s ease',
                  minHeight: 66,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ListItemText
                    primary={variant.language.name[0].value}
                    secondary={variant.language.id}
                  />
                  <PublishedChip published={variant.published} />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={
                      canPreview &&
                      data?.adminVideo?.slug &&
                      variant.language?.slug
                        ? (event) =>
                            handlePreviewClick(
                              event,
                              data.adminVideo.slug,
                              variant.language.slug as string
                            )
                        : undefined
                    }
                    aria-label="preview variant"
                    disabled={!canPreview}
                    sx={{
                      color: canPreview ? 'primary.main' : 'action.disabled',
                      '&:hover': canPreview
                        ? {
                            backgroundColor: 'primary.light',
                            color: 'primary.contrastText'
                          }
                        : {},
                      '&.Mui-disabled': {
                        color: 'action.disabled'
                      }
                    }}
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(event) => handleDeleteClick(event, variant.id)}
                    aria-label="delete variant"
                    sx={{
                      color: 'error.main',
                      '&:hover': {
                        backgroundColor: 'error.light',
                        color: 'error.contrastText'
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </ListItem>
            )
          })}
        </List>
      </Box>
    )
  }

  return (
    <>
      <Stack
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          borderRadius: 1,
          width: '100%',
          p: 2,
          height: 'calc(100vh - 260px)',
          minHeight: 420,
          maxHeight: 'calc(100vh - 220px)'
        }}
      >
        {/* Custom header with both buttons */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" component="h2">
            Audio Languages
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<PublishIcon />}
              onClick={handlePublishAllClick}
              disabled={loading}
              size="small"
            >
              Publish All
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddAudioLanguage}
              size="small"
            >
              Add Audio Language
            </Button>
          </Stack>
        </Stack>

        {/* Content */}
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          {renderContent()}
        </Box>
      </Stack>
      {children}
    </>
  )
}
