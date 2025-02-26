import { useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { GetAdminVideo_AdminVideo_VideoSubtitles } from '../../../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useVideo } from '../../../../../../../../../../libs/VideoProvider'
import { ArrayElement } from '../../../../../../../../../../types/array-types'

export const DELETE_VIDEO_SUBTITLE = graphql(`
  mutation DeleteVideoSubtitle($id: ID!) {
    videoSubtitleDelete(id: $id) {
      id
    }
  }
`)

export type DeleteVideoSubtitleVariables = VariablesOf<
  typeof DELETE_VIDEO_SUBTITLE
>
export type DeleteVideoSubtitle = ResultOf<typeof DELETE_VIDEO_SUBTITLE>

interface SubtitleDeleteProps {
  close: () => void
  subtitle: ArrayElement<GetAdminVideo_AdminVideo_VideoSubtitles>
}

export function SubtitleDelete({ close, subtitle }: SubtitleDeleteProps) {
  const t = useTranslations()
  const { enqueueSnackbar } = useSnackbar()
  const video = useVideo()

  const [deleteSubtitle] = useMutation<
    DeleteVideoSubtitle,
    DeleteVideoSubtitleVariables
  >(DELETE_VIDEO_SUBTITLE, {
    update(cache, { data }) {
      if (data?.videoSubtitleDelete == null) return

      cache.modify({
        id: cache.identify(video),
        fields: {
          videoEditions(existingEditions = [], { readField }) {
            return existingEditions.map((editionRef) => {
              if (readField('id', editionRef) === subtitle.id) {
                cache.modify({
                  id: cache.identify(editionRef),
                  fields: {
                    subtitles(existingSubtitles = [], { readField }) {
                      return existingSubtitles.filter(
                        (subtitleRef) =>
                          readField('id', subtitleRef) !==
                          data.videoSubtitleDelete.id
                      )
                    }
                  }
                })
              }
              return editionRef
            })
          }
        }
      })
    }
  })

  const handleDelete = async () => {
    await deleteSubtitle({
      variables: { id: subtitle.id },
      onCompleted: () => {
        enqueueSnackbar(t('Subtitle deleted successfully.'), {
          variant: 'success'
        })
        close()
      },
      onError: () => {
        enqueueSnackbar(t('Something went wrong.'), { variant: 'error' })
      }
    })
  }

  return (
    <Stack gap={4}>
      <div>
        <Typography variant="h6">
          {t('Are you sure you want to delete this edition?')}
        </Typography>
        <Typography variant="body2">
          {t('This action cannot be undone.')}
        </Typography>
      </div>
      <DialogActions sx={{ gap: 1, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={close}>
          {t('Cancel')}
        </Button>
        <Button variant="contained" color="error" onClick={handleDelete}>
          {t('Delete')}
        </Button>
      </DialogActions>
    </Stack>
  )
}
