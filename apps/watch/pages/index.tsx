import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'

import { HomeHero } from '../src/components/Hero'
import { Videos } from '../src/components/Videos'
import { PageWrapper } from '../src/components/PageWrapper'
import { VideoType } from '../__generated__/globalTypes'

function HomePage(): ReactElement {
  return (
    <PageWrapper hero={<HomeHero />}>
      <Box sx={{ paddingY: '4rem' }}>
        <Stack direction="row" justifyContent="space-between" mb={3}>
          <Typography variant="h4">Series</Typography>
          <Button variant="outlined">See All</Button>
        </Stack>
        <Videos
          filter={{
            availableVariantLanguageIds: ['529'],
            types: [VideoType.playlist]
          }}
          limit={6}
          showLoadMore={false}
          layout="carousel"
        />
      </Box>
    </PageWrapper>
  )
}

export default HomePage
