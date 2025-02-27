import { gql, useMutation } from '@apollo/client'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'

import { useCreateR2AssetMutation } from '../../../../../../../../../../libs/useCreateR2Asset'
import { useDeleteR2AssetMutation } from '../../../../../../../../../../libs/useDeleteR2Asset'
import { useVideo } from '../../../../../../../../../../libs/VideoProvider'
import { SubtitleForm, SubtitleValidationSchema } from '../../SubtitleForm'

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

  const [createR2Asset] = useCreateR2AssetMutation()
  const [deleteR2Asset] = useDeleteR2AssetMutation()
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

    // Create a function for the subtitle update to avoid code duplication
    const performSubtitleUpdate = async (currentSources: typeof sources) => {
      await updateVideoSubtitle({
        variables: {
          input: {
            id: subtitle.id,
            edition: edition.name,
            languageId: values.language,
            primary: values.primary,
            ...currentSources
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

    const file = values.file as File | null

    // Only upload if file exists in the form and the file is not the same as the existing file
    if (file != null && file?.name !== existingFileName) {
      // Delete the existing file if it exists
      if (subtitle.value != null) {
        await deleteR2Asset({
          variables: {
            id: subtitle.id
          },
          onError: (e) => {
            enqueueSnackbar(t('Failed to delete existing file.'), {
              variant: 'error'
            })
          }
        })
      }

      const fileName = getFileName(video, edition, '529', file)

      await createR2Asset({
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

          const uploadUrl = data.cloudflareR2Create.uploadUrl

          const res = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': 'text/vtt'
            }
          })

          if (res.ok) {
            if (data.cloudflareR2Create.publicUrl != null) {
              sources.vttSrc = data.cloudflareR2Create.publicUrl
              await performSubtitleUpdate(sources)
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
    } else {
      // If no new file is being uploaded, just update the subtitle with existing sources
      await performSubtitleUpdate(sources)
    }
  }

  useEffect(() => {
    const fetchSubtitleFile = async () => {
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

        if (!res.ok) {
          throw new Error('Failed to fetch subtitle file.')
        }

        const blob = await res.blob()
        const file = new File([blob], subtitle.fileName, {
          type: 'text/vtt'
        })

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
