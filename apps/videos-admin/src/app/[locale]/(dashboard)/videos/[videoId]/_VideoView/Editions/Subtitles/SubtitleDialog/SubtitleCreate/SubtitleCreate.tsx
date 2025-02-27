import { gql, useMutation } from '@apollo/client'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { GetAdminVideo_AdminVideo_VideoEditions } from '../../../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useCreateR2AssetMutation } from '../../../../../../../../../../libs/useCreateR2Asset'
import { useVideo } from '../../../../../../../../../../libs/VideoProvider'
import { ArrayElement } from '../../../../../../../../../../types/array-types'
import { SubtitleForm } from '../../SubtitleForm'
import { SubtitleValidationSchema } from '../../SubtitleForm/SubtitleForm'

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

  const handleSubmit = async (values: SubtitleValidationSchema) => {
    if (edition == null) return
    dialogState.setLoading(true)

    const file = values.file as File | null

    const performCreateSubtitle = async ({
      vttSrc = null,
      srtSrc = null
    }: {
      vttSrc: string | null
      srtSrc: string | null
    }) => {
      if (edition.name == null) return

      await createVideoSubtitle({
        variables: {
          input: {
            videoId: video.id,
            edition: edition.name,
            languageId: values.language,
            primary: values.primary,
            vttSrc,
            srtSrc
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

    // Create Cloudflare R2 asset
    if (file != null) {
      const fileName = getFileName(video, edition, '529', file)

      await createR2Asset({
        variables: {
          input: {
            videoId: video.id,
            fileName: fileName,
            contentType: file.type
          }
        },
        onCompleted: async (data) => {
          if (data?.cloudflareR2Create?.uploadUrl == null) return

          const uploadUrl = data.cloudflareR2Create.uploadUrl

          const res = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type
            }
          })

          if (res.ok) {
            if (data.cloudflareR2Create.publicUrl != null) {
              await performCreateSubtitle({
                vttSrc: data.cloudflareR2Create.publicUrl,
                srtSrc: null
              })
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
      await performCreateSubtitle({
        vttSrc: null,
        srtSrc: null
      })
    }
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
