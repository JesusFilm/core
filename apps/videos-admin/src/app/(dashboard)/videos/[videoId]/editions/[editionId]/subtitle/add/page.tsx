'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useRef, useState } from 'react'

import { VariablesOf, graphql } from '@core/shared/gql'
import { Dialog } from '@core/shared/ui/Dialog'

import { FormLanguageSelect } from '../../../../../../../../components/FormLanguageSelect'
import { useCreateR2AssetMutation } from '../../../../../../../../libs/useCreateR2Asset'
import { uploadAssetFile } from '../../../../../../../../libs/useCreateR2Asset/uploadAssetFile/uploadAssetFile'
import { getSubtitleR2Path } from '../_getSubtitleR2Path/getSubtitleR2Path'
import { SubtitleFileUpload } from '../_SubtitleFileUpload'
import { subtitleValidationSchema } from '../constants'

const CREATE_VIDEO_SUBTITLE = graphql(`
  mutation CreateVideoSubtitle($input: VideoSubtitleCreateInput!) {
    videoSubtitleCreate(input: $input) {
      id
      vttSrc
      srtSrc
      vttAsset {
        id
      }
      srtAsset {
        id
      }
      srtVersion
      vttVersion
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

const GET_VIDEO_EDITION = graphql(`
  query GetVideoEdition($editionId: ID!) {
    videoEdition(id: $editionId) {
      name
      videoSubtitles {
        language {
          id
        }
      }
    }
  }
`)

interface SubtitleCreateProps {
  params: {
    editionId: string
    videoId: string
  }
}

export default function SubtitleCreate({
  params: { editionId, videoId }
}: SubtitleCreateProps): ReactElement {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const abortController = useRef<AbortController | null>(null)
  const [loading, setLoading] = useState(false)

  const { data } = useSuspenseQuery(GET_VIDEO_EDITION, {
    variables: { editionId }
  })

  const edition = data.videoEdition

  const [createR2Asset] = useCreateR2AssetMutation()
  const [createVideoSubtitle] = useMutation(CREATE_VIDEO_SUBTITLE)

  const returnUrl = `/videos/${videoId}/editions/${editionId}`

  const handleSubmit = async (values: {
    language: string
    vttFile: File | null
    srtFile: File | null
  }) => {
    if (edition == null || edition.name == null) return

    setLoading(true)
    abortController.current = new AbortController()

    const vttFile = values.vttFile
    const srtFile = values.srtFile

    const input: VariablesOf<typeof CREATE_VIDEO_SUBTITLE>['input'] = {
      videoId: videoId,
      edition: edition.name,
      languageId: values.language,
      // English is the default primary subtitle for all videos
      primary: values.language === '529',
      vttSrc: null,
      srtSrc: null,
      vttAssetId: null,
      srtAssetId: null,
      vttVersion: 0,
      srtVersion: 0
    }

    try {
      // Handle VTT file upload
      if (vttFile != null) {
        const fileName = getSubtitleR2Path(
          videoId,
          editionId,
          values.language,
          vttFile
        )

        const result = await createR2Asset({
          variables: {
            input: {
              videoId: videoId,
              fileName: fileName,
              originalFilename: vttFile.name,
              contentType: vttFile.type,
              contentLength: vttFile.size.toString()
            }
          },
          context: {
            fetchOptions: {
              signal: abortController.current?.signal
            }
          }
        })

        if (result.data?.cloudflareR2Create?.uploadUrl == null) {
          throw new Error('Failed to create r2 asset for VTT file.')
        }

        const uploadUrl = result.data.cloudflareR2Create.uploadUrl
        const publicUrl = result.data.cloudflareR2Create.publicUrl

        await uploadAssetFile(vttFile, uploadUrl)

        input.vttSrc = publicUrl
        input.vttAssetId = result.data.cloudflareR2Create.id
        input.vttVersion = 1
      }

      // Handle SRT file upload
      if (srtFile != null) {
        const fileName = getSubtitleR2Path(
          videoId,
          editionId,
          values.language,
          srtFile
        )

        const result = await createR2Asset({
          variables: {
            input: {
              videoId: videoId,
              fileName: fileName,
              originalFilename: srtFile.name,
              contentType: srtFile.type,
              contentLength: srtFile.size.toString()
            }
          },
          context: {
            fetchOptions: {
              signal: abortController.current?.signal
            }
          }
        })

        if (result.data?.cloudflareR2Create?.uploadUrl == null) {
          throw new Error('Failed to create r2 asset for SRT file.')
        }

        const uploadUrl = result.data.cloudflareR2Create.uploadUrl
        const publicUrl = result.data.cloudflareR2Create.publicUrl

        await uploadAssetFile(srtFile, uploadUrl)

        input.srtSrc = publicUrl
        input.srtAssetId = result.data.cloudflareR2Create.id
        input.srtVersion = 1
      }

      await createVideoSubtitle({
        variables: {
          input
        },
        onCompleted: () => {
          enqueueSnackbar('Successfully created subtitle.', {
            variant: 'success'
          })
          router.push(returnUrl, {
            scroll: false
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
        enqueueSnackbar('Subtitle create cancelled.')
      } else {
        enqueueSnackbar('Failed to create subtitle.', {
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
    id: '529'
  }

  return (
    <Dialog
      open={true}
      onClose={() =>
        router.push(returnUrl, {
          scroll: false
        })
      }
      dialogTitle={{
        title: 'Add Subtitle',
        closeButton: true
      }}
      testId="add-subtitle-dialog"
    >
      <Formik
        initialValues={{ language: '', vttFile: null, srtFile: null }}
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
            />
            <SubtitleFileUpload />
            <Button
              variant="contained"
              type="submit"
              fullWidth
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Upload'}
            </Button>
          </Stack>
        </Form>
      </Formik>
    </Dialog>
  )
}
