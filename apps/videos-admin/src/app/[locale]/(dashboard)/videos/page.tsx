import { PageContainer } from '@toolpad/core/PageContainer'
import { ReactElement } from 'react'

import { VideoList } from '../../../../components/VideoList'

export default function Index(): ReactElement {
  return (
    <PageContainer fixed maxWidth={false}>
      <VideoList />
    </PageContainer>
  )
}
