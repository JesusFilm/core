import Container from '@mui/material/Container'
import { ReactElement } from 'react'
import { VideosHero } from '../src/components/Hero/VideosHero/VideosHero'
import { PageWrapper } from '../src/components/PageWrapper'
import { Videos } from '../src/components/Videos'

const limit = 20

function VideosPage(): ReactElement {
  return (
    <PageWrapper>
      <VideosHero />
      <Container maxWidth="xxl">
        <Videos layout="grid" limit={limit} />
      </Container>
    </PageWrapper>
  )
}

export default VideosPage
