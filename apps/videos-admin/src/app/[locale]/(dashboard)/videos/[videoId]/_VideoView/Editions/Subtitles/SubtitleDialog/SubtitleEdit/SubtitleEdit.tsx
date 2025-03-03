import { useMutation } from '@apollo/client'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useRef, useState } from 'react'

import { GetAdminVideo_AdminVideo_VideoEditions } from '../../../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useCreateR2AssetMutation } from '../../../../../../../../../../libs/useCreateR2Asset'
import { useVideo } from '../../../../../../../../../../libs/VideoProvider'
import { ArrayElement } from '../../../../../../../../../../types/array-types'
import { SubtitleForm, SubtitleValidationSchema } from '../../SubtitleForm'
import { getSubtitleR2Path } from '../getSubtitleR2Path'

export const UPDATE_VIDEO_SUBTITLE = graphql(`
  mutation UpdateVideoSubtitle($input: VideoSubtitleUpdateInput!) {
    videoSubtitleUpdate(input: $input) {
      id
      value
      primary
      language {
        id
        name {
          value
          primary
        }
        slug
      }
    }
  }
`)

export type UpdateVideoSubtitleVariables = VariablesOf<
  typeof UPDATE_VIDEO_SUBTITLE
>
export type UpdateVideoSubtitle = ResultOf<typeof UPDATE_VIDEO_SUBTITLE>

function extractSubtitleFileName(subtitle: any) {
  if (subtitle.value == null) return null

  const fileName = subtitle.value.split('/').pop()
  return fileName
}

type Edition = ArrayElement<GetAdminVideo_AdminVideo_VideoEditions>
type Subtitle = ArrayElement<Edition['videoSubtitles']>

interface SubtitleEditProps {
  edition: Edition
  subtitle: Subtitle
}

export function SubtitleEdit({
  subtitle,
  edition
}: SubtitleEditProps): ReactElement {
  const video = useVideo()
  const t = useTranslations()
  const { enqueueSnackbar } = useSnackbar()
  const abortController = useRef<AbortController | null>(null)
  const [loading, setLoading] = useState(false)

  const [createR2Asset] = useCreateR2AssetMutation()
  const [updateVideoSubtitle] = useMutation(UPDATE_VIDEO_SUBTITLE)

  const handleSubmit = async (values: SubtitleValidationSchema) => {
    setLoading(true)

    const sources: { vttSrc: string | null; srtSrc: string | null } = {
      vttSrc: subtitle.vttSrc ?? null,
      srtSrc: subtitle.srtSrc ?? null
    }

    const existingFileName = extractSubtitleFileName(subtitle)

    const performSubtitleUpdate = async (currentSources: typeof sources) => {
      await updateVideoSubtitle({
        variables: {
          input: {
            id: subtitle.id,
            edition: edition.name ?? '',
            languageId: values.language,
            primary: values.primary,
            ...currentSources
          }
        },
        onCompleted: () => {
          enqueueSnackbar(t('Successfully updated subtitle.'), {
            variant: 'success'
          })
          setLoading(false)
        },
        onError: () => {
          enqueueSnackbar(t('Failed to update subtitle.'), {
            variant: 'error'
          })
        }
      })
    }

    const file = values.file as File | null

    // Only upload if file exists in the form and the file is not the same as the existing file
    if (file != null && file?.name !== existingFileName) {
      const fileName = getSubtitleR2Path(video, edition, '529', file)

      await createR2Asset({
        variables: {
          input: {
            videoId: video.id,
            fileName: fileName,
            contentType: file.type,
            contentLength: file.size
          }
        },
        onCompleted: async (data) => {
          if (data?.cloudflareR2Create?.uploadUrl == null) return

          const uploadUrl = data.cloudflareR2Create.uploadUrl

          try {
            const res = await fetch(uploadUrl, {
              method: 'PUT',
              body: file,
              headers: {
                'Content-Type': file.type
              },
              signal: abortController.current?.signal
            })

            if (res.ok && data.cloudflareR2Create.publicUrl != null) {
              if (file.type === 'text/vtt') {
                sources.vttSrc = data.cloudflareR2Create.publicUrl
              } else if (file.type === 'application/x-subrip') {
                sources.srtSrc = data.cloudflareR2Create.publicUrl
              }

              await performSubtitleUpdate(sources)
            } else {
              setLoading(false)
              enqueueSnackbar(t('Failed to upload subtitle file.'), {
                variant: 'error'
              })
            }
          } catch (e) {
            setLoading(false)
            enqueueSnackbar(t('Failed to upload subtitle file.'), {
              variant: 'error'
            })
          }
        },
        onError: (e) => {
          if (e.message.includes('aborted')) {
            enqueueSnackbar(t('Upload cancelled.'))
          } else {
            enqueueSnackbar(t('Failed to create r2 asset.'), {
              variant: 'error'
            })
          }
          setLoading(false)
        }
      })
    } else {
      await performSubtitleUpdate(sources)
    }
  }

  useEffect(() => {
    return () => {
      if (abortController.current != null) {
        abortController.current.abort()
        abortController.current = null
      }
    }
  }, [])

  return (
    <SubtitleForm
      variant="edit"
      subtitle={subtitle}
      initialValues={{
        language: subtitle.language.id,
        primary: subtitle.primary,
        file: null // TODO: update this to the existing file
      }}
      onSubmit={handleSubmit}
      loading={loading}
    />
  )
}
