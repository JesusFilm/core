import Grid from '@mui/material/Grid2'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { useRelatedProducts } from 'react-instantsearch'

import { AlgoliaVideo } from '@core/journeys/ui/algolia/useAlgoliaVideos'

import { transformAlgoliaVideos } from '../../../libs/algolia/transformAlgoliaVideos'
import { useVideo } from '../../../libs/videoContext'
import { VideoCard } from '../../VideoCard'

export function RelatedVideos(): ReactElement {
  const { t } = useTranslation()

  const { variant } = useVideo()
  const { items } = useRelatedProducts<AlgoliaVideo>({
    objectIDs: [variant?.id ?? '']
  })

  const related = transformAlgoliaVideos(items)

  return (
    <Stack>
      <Typography variant="h4">{t('Related')}</Typography>
      <Grid container spacing={4}>
        {related.map((video, index) => (
          <Grid key={index} size={{ xs: 12, md: 4, xl: 3 }}>
            <VideoCard video={video} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
