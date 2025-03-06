import { gql, useMutation } from '@apollo/client'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useRef, useState } from 'react'

import {
  GetAdminVideo_AdminVideo_VideoEdition as Edition,
  GetAdminVideo_AdminVideo_VideoEdition_VideoSubtitle as Subtitle
} from '../../../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useCreateR2AssetMutation } from '../../../../../../../../../../libs/useCreateR2Asset'
import { useVideo } from '../../../../../../../../../../libs/VideoProvider'
import { SubtitleForm } from '../../SubtitleForm'
import { SubtitleValidationSchema } from '../../SubtitleForm/SubtitleForm'
import { getSubtitleR2Path } from '../getSubtitleR2Path'

export const CREATE_VIDEO_SUBTITLE = graphql(`
  mutation CreateVideoSubtitle($input: VideoSubtitleCreateInput!) {
    videoSubtitleCreate(input: $input) {
      id
      vttSrc
      srtSrc
      value
      primary
      edition
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

export type CreateVideoSubtitleVariables = VariablesOf<
  typeof CREATE_VIDEO_SUBTITLE
>
export type CreateVideoSubtitle = ResultOf<typeof CREATE_VIDEO_SUBTITLE>

interface SubtitleCreateProps {
  close: () => void
  edition: Edition
  subtitleLanguagesMap: Map<string, Subtitle>
}

export function SubtitleCreate({
  close,
  edition,
  subtitleLanguagesMap
}: SubtitleCreateProps): ReactElement {
  const video = useVideo()
  const t = useTranslations()
  const { enqueueSnackbar } = useSnackbar()
  const abortController = useRef<AbortController | null>(null)
  const [loading, setLoading] = useState(false)

  const [createR2Asset] = useCreateR2AssetMutation()
  const [createVideoSubtitle] = useMutation(CREATE_VIDEO_SUBTITLE, {
    update(cache, { data }) {
      if (data?.videoSubtitleCreate == null) return

      const newSubtitleRef = cache.writeFragment({
        data: data.videoSubtitleCreate,
        fragment: gql`
          fragment NewVideoSubtitle on VideoSubtitle {
            id
            vttSrc
            srtSrc
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
        `
      })

      cache.modify({
        id: cache.identify(edition),
        fields: {
          videoSubtitles(existingSubtitles = []) {
            return [...existingSubtitles, newSubtitleRef]
          }
        }
      })
    }
  })

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
    if (edition == null || edition.name == null) return

    setLoading(true)
    abortController.current = new AbortController()

    const vttFile = values.vttFile as File | null
    const srtFile = values.srtFile as File | null

    const input: CreateVideoSubtitleVariables['input'] = {
      videoId: video.id,
      edition: edition.name,
      languageId: values.language,
      // English is the default primary subtitle for all videos
      primary: values.language === '529',
      vttSrc: null,
      srtSrc: null
    }

    try {
      // Handle VTT file upload
      if (vttFile != null) {
        const fileName = getSubtitleR2Path(
          video,
          edition,
          values.language,
          vttFile
        )

        const result = await createR2Asset({
          variables: {
            input: {
              videoId: video.id,
              fileName: fileName,
              contentType: vttFile.type,
              contentLength: vttFile.size
            }
          },
          context: {
            fetchOptions: {
              signal: abortController.current?.signal
            }
          }
        })

        if (result.data?.cloudflareR2Create?.uploadUrl == null) {
          throw new Error(t('Failed to create r2 asset for VTT file.'))
        }

        const uploadUrl = result.data.cloudflareR2Create.uploadUrl
        const publicUrl = result.data.cloudflareR2Create.publicUrl

        await uploadAssetFile(vttFile, uploadUrl)
        input.vttSrc = publicUrl
      }

      // Handle SRT file upload
      if (srtFile != null) {
        const fileName = getSubtitleR2Path(
          video,
          edition,
          values.language,
          srtFile
        )

        const result = await createR2Asset({
          variables: {
            input: {
              videoId: video.id,
              fileName: fileName,
              contentType: srtFile.type,
              contentLength: srtFile.size
            }
          },
          context: {
            fetchOptions: {
              signal: abortController.current?.signal
            }
          }
        })

        if (result.data?.cloudflareR2Create?.uploadUrl == null) {
          throw new Error(t('Failed to create r2 asset for SRT file.'))
        }

        const uploadUrl = result.data.cloudflareR2Create.uploadUrl
        const publicUrl = result.data.cloudflareR2Create.publicUrl

        await uploadAssetFile(srtFile, uploadUrl)
        input.srtSrc = publicUrl
      }

      await createVideoSubtitle({
        variables: {
          input
        },
        onCompleted: () => {
          enqueueSnackbar(t('Successfully created subtitle.'), {
            variant: 'success'
          })
        },
        context: {
          fetchOptions: {
            signal: abortController.current?.signal
          }
        }
      })

      close()
    } catch (e) {
      if (e.name === 'AbortError' || e.message.includes('aborted')) {
        enqueueSnackbar(t('Subtitle create cancelled.'))
      } else {
        enqueueSnackbar(t('Failed to create subtitle.'), {
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
      variant="create"
      initialValues={{ language: '', vttFile: null, srtFile: null }}
      onSubmit={handleSubmit}
      loading={loading}
      subtitleLanguagesMap={subtitleLanguagesMap}
    />
  )
}
