import { gql, useMutation } from '@apollo/client'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useRef, useState } from 'react'

import { GetAdminVideo_AdminVideo_VideoEditions } from '../../../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useCreateR2AssetMutation } from '../../../../../../../../../../libs/useCreateR2Asset'
import { useVideo } from '../../../../../../../../../../libs/VideoProvider'
import { ArrayElement } from '../../../../../../../../../../types/array-types'
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
  edition: ArrayElement<GetAdminVideo_AdminVideo_VideoEditions>
}

export function SubtitleCreate({
  close,
  edition
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

  const handleSubmit = async (values: SubtitleValidationSchema) => {
    if (edition == null) return
    setLoading(true)
    abortController.current = new AbortController()

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
          setLoading(false)
          close()
        },
        onError: (e) => {
          if (e.message.includes('aborted')) {
            enqueueSnackbar(t('Subtitle creation cancelled.'))
          } else {
            enqueueSnackbar(t('Failed to create subtitle.'), {
              variant: 'error'
            })
          }
          setLoading(false)
        },
        context: {
          fetchOptions: {
            signal: abortController.current?.signal
          }
        }
      })
    }

    // Create Cloudflare R2 asset
    if (file != null) {
      const fileName = getSubtitleR2Path(video, edition, '529', file)

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
          const publicUrl = data.cloudflareR2Create.publicUrl

          try {
            const res = await fetch(uploadUrl, {
              method: 'PUT',
              body: file,
              headers: {
                'Content-Type': file.type
              },
              signal: abortController.current?.signal
            })

            if (res.ok && publicUrl != null) {
              const sources: {
                vttSrc: string | null
                srtSrc: string | null
              } = {
                vttSrc: null,
                srtSrc: null
              }

              if (file.type === 'text/vtt') {
                sources.vttSrc = publicUrl
              } else if (file.type === 'application/x-subrip') {
                sources.srtSrc = publicUrl
              }

              await performCreateSubtitle(sources)
            } else {
              enqueueSnackbar(t('Failed to upload subtitle file.'), {
                variant: 'error'
              })
            }
          } catch (e) {
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
        },
        context: {
          fetchOptions: {
            signal: abortController.current?.signal
          }
        }
      })
    } else {
      await performCreateSubtitle({
        vttSrc: null,
        srtSrc: null
      })
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
      initialValues={{ language: '', primary: false }}
      onSubmit={handleSubmit}
      loading={loading}
    />
  )
}
