import { gql, useMutation } from '@apollo/client'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { GetAdminVideo_AdminVideo_VideoEditions } from '../../../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useVideo } from '../../../../../../../../../../libs/VideoProvider'
import { ArrayElement } from '../../../../../../../../../../types/array-types'
import { SubtitleForm } from '../../SubtitleForm'
import { SubtitleValidationSchema } from '../../SubtitleForm/SubtitleForm'

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

const getFileName = (video, edition, languageId, file) => {
  const extension = file.name.split('.').pop()
  return `${video.id}/editions/${edition.id}/subtitles/${video.id}_${edition.id}_${languageId}.${extension}`
}

interface SubtitleCreateProps {
  close: () => void
  edition: ArrayElement<GetAdminVideo_AdminVideo_VideoEditions>
  dialogState: {
    loading: boolean
    setLoading: (loading: boolean) => void
  }
}

export function SubtitleCreate({
  close,
  edition,
  dialogState
}: SubtitleCreateProps): ReactElement {
  const video = useVideo()
  const t = useTranslations()
  const { enqueueSnackbar } = useSnackbar()
  const [createCloudflareR2Asset] = useMutation(CREATE_CLOUDFLARE_R2_ASSET)

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

  const handleSubmit = async (values: SubtitleValidationSchema) => {
    if (edition == null || edition.name == null) return
    dialogState.setLoading(true)

    console.log('handle submit', values)

    const sources: { vttSrc: string | null; srtSrc: string | null } = {
      vttSrc: null,
      srtSrc: null
    }

    // Create Cloudflare R2 asset
    if (values.file != null) {
      console.log('file submit', values)
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
            dialogState.setLoading(false)
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

    await createVideoSubtitle({
      variables: {
        input: {
          videoId: video.id,
          edition: edition.name,
          languageId: values.language,
          primary: values.primary,
          ...sources
        }
      },
      onCompleted: () => {
        enqueueSnackbar(t('Successfully created subtitle.'), {
          variant: 'success'
        })
        dialogState.setLoading(false)
        close()
      },
      onError: () => {
        enqueueSnackbar(t('Failed to create subtitle.'), {
          variant: 'error'
        })
        dialogState.setLoading(false)
      }
    })
  }

  return (
    <SubtitleForm
      variant="create"
      initialValues={{ language: '', primary: false }}
      onSubmit={handleSubmit}
      loading={dialogState.loading}
    />
  )
}
