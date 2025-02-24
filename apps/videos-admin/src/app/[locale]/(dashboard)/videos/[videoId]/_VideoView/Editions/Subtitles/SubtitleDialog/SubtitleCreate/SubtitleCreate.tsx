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

    await createVideoSubtitle({
      variables: {
        input: {
          videoId: video.id,
          edition: edition.name,
          languageId: values.language,
          primary: values.primary,
          vttSrc: values.vttSrc,
          srtSrc: values.srtSrc
        }
      },
      onCompleted: () => {
        enqueueSnackbar(t('Successfully created subtitle.'), {
          variant: 'success'
        })
        close()
      },
      onError: () => {
        enqueueSnackbar(t('Failed to create subtitle.'), {
          variant: 'error'
        })
      }
    })
  }

  return (
    <SubtitleForm
      variant="create"
      initialValues={{ language: '', primary: false }}
      onSubmit={handleSubmit}
      edition={edition}
    />
  )
}
