import { gql, useMutation } from '@apollo/client'
import { graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { SubtitleForm, SubtitleValidationSchema } from '../../SubtitleForm'

export const UPDATE_VIDEO_SUBTITLE = graphql(`
  mutation UpdateVideoSubtitle($input: VideoSubtitleUpdateInput!) {
    videoSubtitleUpdate(input: $input) {
      id
    }
  }
`)

export function SubtitleEdit({
  subtitle,
  edition,
  close
}: {
  subtitle: any
  edition: any
  close: () => void
}): ReactElement {
  const t = useTranslations()
  const { enqueueSnackbar } = useSnackbar()
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
    await updateVideoSubtitle({
      variables: {
        input: {
          id: subtitle.id,
          edition: edition.name,
          languageId: values.language,
          primary: values.primary,
          vttSrc: values.vttSrc,
          srtSrc: values.srtSrc
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

  console.log({ subtitle })

  return (
    <SubtitleForm
      variant="edit"
      edition={edition}
      subtitle={subtitle}
      initialValues={{
        language: subtitle.language.id,
        primary: subtitle.primary
      }}
      onSubmit={handleSubmit}
    />
  )
}
