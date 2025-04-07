import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useRef, useState } from 'react'

import {
  GetAdminVideo_AdminVideo_VideoEdition as Edition,
  GetAdminVideo_AdminVideo_VideoEdition_VideoSubtitle as Subtitle
} from '../../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useCreateR2AssetMutation } from '../../../../../../../../../libs/useCreateR2Asset'
import {
  UpdateVideoSubtitleVariables,
  useUpdateVideoSubtitle
} from '../../../../../../../../../libs/useUpdateVideoSubtitle'
import { useVideo } from '../../../../../../../../../libs/VideoProvider'
import { SubtitleForm, SubtitleValidationSchema } from '../../SubtitleForm'

import { handleSrtFile } from './handleSrtFile'
import { handleVttFile } from './handleVttFile'

interface SubtitleEditProps {
  edition: Edition
  subtitle: Subtitle
  subtitleLanguagesMap: Map<string, Subtitle>
}

export function SubtitleEdit({
  edition,
  subtitle,
  subtitleLanguagesMap
}: SubtitleEditProps): ReactElement {
  const video = useVideo()
  const { enqueueSnackbar } = useSnackbar()
  const abortController = useRef<AbortController | null>(null)
  const [loading, setLoading] = useState(false)

  const [createR2Asset] = useCreateR2AssetMutation()
  const [updateVideoSubtitle] = useUpdateVideoSubtitle()

  const uploadAssetFile = async (file: File, uploadUrl: string) => {
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
      signal: abortController.current?.signal
    })
    if (!res.ok) {
      throw new Error('Failed to upload subtitle file.')
    }
  }

  const handleSubmit = async (values: SubtitleValidationSchema) => {
    if (edition == null || edition.name == null) return

    setLoading(true)
    abortController.current = new AbortController()

    const vttFile = values.vttFile as File | null
    const srtFile = values.srtFile as File | null

    const input: UpdateVideoSubtitleVariables['input'] = {
      id: subtitle.id,
      edition: edition.name,
      languageId: values.language,
      primary: values.language === '529',
      vttSrc: subtitle.vttSrc ?? null,
      srtSrc: subtitle.srtSrc ?? null,
      vttAssetId: subtitle.vttAsset?.id,
      srtAssetId: subtitle.srtAsset?.id,
      vttVersion: subtitle.vttVersion,
      srtVersion: subtitle.srtVersion
    }

    try {
      // Handle VTT file upload
      if (vttFile != null) {
        const result = await handleVttFile({
          vttFile,
          video,
          edition,
          languageId: subtitle.language.id,
          createR2Asset,
          uploadAssetFile,
          abortController,
          errorMessage: 'Failed to create r2 asset for VTT file.'
        })
        input.vttSrc = result.publicUrl
        input.vttAssetId = result.r2AssetId
        input.vttVersion = Number(subtitle.vttVersion) + 1
      }

      // Handle SRT file upload
      if (srtFile != null) {
        const result = await handleSrtFile({
          srtFile,
          video,
          edition,
          languageId: subtitle.language.id,
          createR2Asset,
          uploadAssetFile,
          abortController,
          errorMessage: 'Failed to create r2 asset for SRT file.'
        })
        input.srtSrc = result.publicUrl
        input.srtAssetId = result.r2AssetId
        input.srtVersion = Number(subtitle.srtVersion) + 1
      }
      await updateVideoSubtitle({
        variables: {
          input
        },
        onCompleted: () => {
          enqueueSnackbar('Successfully updated subtitle.', {
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
        enqueueSnackbar('Subtitle update cancelled.')
      } else {
        enqueueSnackbar('Failed to update subtitle.', {
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
        vttFile: null,
        srtFile: null
      }}
      onSubmit={handleSubmit}
      loading={loading}
      subtitleLanguagesMap={subtitleLanguagesMap}
    />
  )
}
