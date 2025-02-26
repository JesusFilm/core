import { gql, useMutation } from '@apollo/client'
import axios from 'axios'
import { graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'

import { useVideo } from '../../../../../../../../../../libs/VideoProvider'
import { SubtitleForm, SubtitleValidationSchema } from '../../SubtitleForm'

export const CREATE_CLOUDFLARE_R2_ASSET = graphql(`
  mutation CreateCloudflareR2Asset($input: CloudflareR2CreateInput!) {
    cloudflareR2Create(input: $input) {
      id
      fileName
      uploadUrl
      publicUrl
    }
  }
`)

export const DELETE_CLOUDFLARE_R2_ASSET = graphql(`
  mutation DeleteCloudflareR2Asset($id: ID!) {
    cloudflareR2Delete(id: $id) {
      id
    }
  }
`)

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

const getFileName = (video, edition, languageId, file) => {
  const extension = file.name.split('.').pop()
  return `${video.id}/editions/${edition.id}/subtitles/${video.id}_${edition.id}_${languageId}.${extension}`
}

function extractSubtitleFileName(subtitle: any) {
  if (subtitle.value == null) return null

  const fileName = subtitle.value.split('/').pop()
  return fileName
}

interface SubtitleEditProps {
  subtitle: any
  edition: any
  close: () => void
  dialogState: {
    loading: boolean
    setLoading: (loading: boolean) => void
  }
}

export function SubtitleEdit({
  subtitle,
  edition,
  close,
  dialogState
}: SubtitleEditProps): ReactElement {
  const video = useVideo()
  const t = useTranslations()
  const { enqueueSnackbar } = useSnackbar()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const [createCloudflareR2Asset] = useMutation(CREATE_CLOUDFLARE_R2_ASSET)
  const [deleteCloudflareR2Asset] = useMutation(DELETE_CLOUDFLARE_R2_ASSET)
  const [updateVideoSubtitle] = useMutation(UPDATE_VIDEO_SUBTITLE, {
    update(cache, { data }) {
      if (data?.videoSubtitleUpdate == null) return

      cache.modify({
        id: cache.identify(edition),
        fields: {
          videoSubtitles(existingData) {
            const newVideoSubtitleRef = cache.writeFragment({
              data: data.videoSubtitleUpdate,
              fragment: gql`
                fragment NewVideoSubtitle on VideoSubtitle {
                  id
                }
              `
            })

            return [...existingData, newVideoSubtitleRef]
          }
        }
      })
    }
  })

  const handleSubmit = async (values: SubtitleValidationSchema) => {
    const sources: { vttSrc: string | null; srtSrc: string | null } = {
      vttSrc: subtitle.vttSrc ?? null,
      srtSrc: subtitle.srtSrc ?? null
    }

    const existingFileName = extractSubtitleFileName(subtitle)

    // Only upload if file exists in the form and the file is not the same as the existing file
    if (values.file != null && values.file?.name !== existingFileName) {
      // Delete the existing file if it exists
      if (subtitle.value != null) {
        await deleteCloudflareR2Asset({
          variables: {
            id: subtitle.value
          },
          onCompleted: () => {
            console.log('deleted existing file')
          },
          onError: (e) => {
            console.error('failed to delete existing file', e)
          }
        })
      }

      const fileName = getFileName(video, edition, '529', values.file)

      await createCloudflareR2Asset({
        variables: {
          input: {
            videoId: video.id,
            fileName: fileName,
            // TODO: figure out how to handle srt files
            contentType: 'text/vtt'
          }
        },
        onCompleted: async (data) => {
          if (data?.cloudflareR2Create?.uploadUrl == null) return
          console.log({ data })

          if (data.cloudflareR2Create.publicUrl != null) {
            sources.vttSrc = data.cloudflareR2Create.publicUrl
          }

          const uploadUrl = data.cloudflareR2Create.uploadUrl

          const res = await fetch(uploadUrl, {
            method: 'PUT',
            body: values.file,
            headers: {
              'Content-Type': 'text/vtt'
            }
          })

          if (res.ok) {
            if (data.cloudflareR2Create.publicUrl != null) {
              sources.vttSrc = data.cloudflareR2Create.publicUrl
            }
          } else {
            enqueueSnackbar(t('Failed to upload subtitle file.'), {
              variant: 'error'
            })
          }
        },
        onError: () => {
          enqueueSnackbar(t('Failed to create subtitle.'), {
            variant: 'error'
          })
          dialogState.setLoading(false)
        }
      })
    }

    await updateVideoSubtitle({
      variables: {
        input: {
          id: subtitle.id,
          edition: edition.name,
          languageId: values.language,
          primary: values.primary,
          ...sources
        }
      },
      onCompleted: () => {
        enqueueSnackbar(t('Successfully updated subtitle.'), {
          variant: 'success'
        })
      },
      onError: () => {
        enqueueSnackbar(t('Failed to update subtitle.'), {
          variant: 'error'
        })
      }
    })
  }

  useEffect(() => {
    const fetchSubtitleFile = async () => {
      console.log('fetching subtitle file')
      setLoading(true)
      try {
        // const res = await axios.get(subtitle.value)
        const res = await fetch(subtitle.value, {
          mode: 'cors',
          method: 'GET',
          headers: {
            'Response-Type': 'text/vtt'
          }
        })

        console.log({ res })

        if (!res.ok) {
          throw new Error('Failed to fetch subtitle file.')
        }

        const blob = await res.blob()
        const file = new File([blob], subtitle.fileName, {
          type: 'text/vtt'
        })
        console.log({ file })

        // setFile(file)
      } catch (e) {
        enqueueSnackbar(t('Failed to fetch subtitle file.'), {
          variant: 'error'
        })
        console.error(e)
      }

      setLoading(false)
    }

    if (subtitle.vttSrc != null && file == null && !loading) {
      void fetchSubtitleFile()
    }

    console.log({ subtitle })
  }, [subtitle])

  return (
    <SubtitleForm
      variant="edit"
      subtitle={subtitle}
      initialValues={{
        language: subtitle.language.id,
        primary: subtitle.primary,
        file: null
      }}
      onSubmit={handleSubmit}
      loading={dialogState.loading}
    />
  )
}
