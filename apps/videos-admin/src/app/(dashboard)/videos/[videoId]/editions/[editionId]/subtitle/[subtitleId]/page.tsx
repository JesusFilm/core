'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { Form, Formik } from 'formik'
import { graphql } from 'gql.tada'
import { useSnackbar } from 'notistack'
import { useEffect, useRef, useState } from 'react'
import { mixed, object, string } from 'yup'

import { FormLanguageSelect } from '../../../../../../../../components/FormLanguageSelect'
import { useCreateR2AssetMutation } from '../../../../../../../../libs/useCreateR2Asset/useCreateR2Asset'
import { DEFAULT_VIDEO_LANGUAGE_ID } from '../../../../../constants'
import { SubtitleFileUpload } from '../_upload'
import { subtitleValidationSchema } from '../constants'

import { handleSrtFile } from './_handleSrtFile'
import { handleVttFile } from './_handleVttFile'

const GET_SUBTITLE = graphql(`
  query GetSubtitle($editionId: ID!, $languageId: ID!) {
    videoEdition(id: $editionId) {
      name
      videoSubtitles {
        id
        vttSrc
        srtSrc
        vttAsset {
          id
        }
        srtAsset {
          id
        }
        vttVersion
        srtVersion
        language {
          id
          name(primary: true, languageId: $languageId) {
            value
            primary
          }
          slug
        }
      }
    }
  }
`)

const UPDATE_VIDEO_SUBTITLE = graphql(`
  mutation UpdateVideoSubtitle($input: VideoSubtitleUpdateInput!) {
    videoSubtitleUpdate(input: $input) {
      id
      value
      primary
      vttSrc
      srtSrc
      language {
        id
        name {
          value
          primary
        }
        slug
      }
      vttAsset {
        id
      }
      srtAsset {
        id
      }
      vttVersion
      srtVersion
    }
  }
`)

interface SubtitlePageProps {
  params: {
    videoId: string
    editionId: string
    subtitleId: string
  }
}

export default function SubtitlePage({
  params: { videoId, editionId, subtitleId }
}: SubtitlePageProps) {
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const abortController = useRef<AbortController | null>(null)
  const [createR2Asset] = useCreateR2AssetMutation()
  const { data } = useSuspenseQuery(GET_SUBTITLE, {
    variables: { editionId, languageId: DEFAULT_VIDEO_LANGUAGE_ID }
  })
  const edition = data.videoEdition
  const subtitle = data.videoEdition?.videoSubtitles.find(
    (subtitle) => subtitle.id === subtitleId
  )
  if (!subtitle) {
    return <div>Subtitle not found</div>
  }

  const [updateSubtitle] = useMutation(UPDATE_VIDEO_SUBTITLE)

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

  const handleSubmit = async (values: {
    language: string
    vttFile: File | null
    srtFile: File | null
  }) => {
    if (!edition) return

    setLoading(true)
    abortController.current = new AbortController()

    const vttFile = values.vttFile
    const srtFile = values.srtFile

    const input = {
      id: subtitle.id,
      edition: edition.name as string,
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
          videoId,
          editionId,
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
          videoId,
          editionId,
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
      await updateSubtitle({
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

  const subtitleLanguagesMap = edition?.videoSubtitles.map(
    (subtitle) => subtitle.language.id
  )

  const initialLanguage = {
    id: subtitle.language?.id ?? '529',
    localName: subtitle.language.name?.find(({ primary }) => !primary)?.value,
    nativeName: subtitle.language.name?.find(({ primary }) => primary)?.value,
    slug: subtitle.language?.slug
  }

  return (
    <Formik
      initialValues={{
        language: subtitle.language.id,
        vttFile: null,
        srtFile: null
      }}
      validationSchema={subtitleValidationSchema}
      onSubmit={handleSubmit}
    >
      <Form data-testid="SubtitleForm">
        <Stack gap={2}>
          <FormLanguageSelect
            name="language"
            label="Language"
            initialLanguage={initialLanguage}
            existingLanguageIds={subtitleLanguagesMap}
            parentObjectId={subtitle?.id}
          />
          <SubtitleFileUpload subtitle={subtitle} />
          <Button
            variant="contained"
            type="submit"
            fullWidth
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Update'}
          </Button>
        </Stack>
      </Form>
    </Formik>
  )
}
