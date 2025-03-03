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

  const uploadAssetFile = async (file: File, uploadUrl: string) => {
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
      signal: abortController.current?.signal
    })

    if (!res.ok) {
      throw new Error(t('Failed to upload subtitle file.'))
    }
  }

  const handleSubmit = async (values: SubtitleValidationSchema) => {
    if (edition.name == null) return
    setLoading(true)

    const input: UpdateVideoSubtitleVariables['input'] = {
      id: subtitle.id,
      edition: edition.name,
      languageId: values.language,
      primary: values.primary,
      vttSrc: subtitle.vttSrc ?? null,
      srtSrc: subtitle.srtSrc ?? null
    }

    const file = values.file as File | null
    const existingFileName = extractSubtitleFileName(subtitle)

    try {
      if (file != null && file?.name !== existingFileName) {
        const fileName = getSubtitleR2Path(
          video,
          edition,
          values.language,
          file
        )

        const result = await createR2Asset({
          variables: {
            input: {
              videoId: video.id,
              fileName: fileName,
              contentType: file.type,
              contentLength: file.size
            }
          },
          context: {
            fetchOptions: {
              signal: abortController.current?.signal
            }
          }
        })

        if (result.data?.cloudflareR2Create?.uploadUrl == null) {
          throw new Error(t('Failed to create r2 asset.'))
        }

        const uploadUrl = result.data.cloudflareR2Create.uploadUrl
        const publicUrl = result.data.cloudflareR2Create.publicUrl

        await uploadAssetFile(file, uploadUrl)

        if (file.type === 'text/vtt') {
          input.vttSrc = publicUrl
        } else if (file.type === 'application/x-subrip') {
          input.srtSrc = publicUrl
        }
      }

      await updateVideoSubtitle({
        variables: {
          input
        },
        onCompleted: () => {
          enqueueSnackbar(t('Successfully updated subtitle.'), {
            variant: 'success'
          })
        },
        context: {
          fetchOptions: {
            signal: abortController.current?.signal
          }
        }
      })
    } catch (e) {
      if (e.name === 'AbortError' || e.message.includes('aborted')) {
        enqueueSnackbar(t('Subtitle update cancelled.'))
      } else {
        enqueueSnackbar(t('Failed to update subtitle.'), {
          variant: 'error'
        })
      }
    } finally {
      setLoading(false)
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
