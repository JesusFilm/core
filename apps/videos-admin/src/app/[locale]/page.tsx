import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'
import { ReactElement, Suspense } from 'react'

import { VideoList } from '../../components/VideoList'
import { VideoListLoading } from '../../components/VideoList/VideoListLoading'
import { VideoListHead } from '../../components/VideoListHead'

export default function Index(): ReactElement {
  const t = useTranslations()

  return (
    <Box>
      <Stack justifyContent="center" alignItems="center">
        <Box sx={{ m: 5 }}>
          <Typography variant="h4">{t('Videos')}</Typography>
        </Box>
      </Stack>
      <Suspense fallback={<VideoListLoading />}>
        <VideoList header={<VideoListHead />} />
      </Suspense>
    </Box>
  )
}
