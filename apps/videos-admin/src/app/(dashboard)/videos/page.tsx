import { ReactElement } from 'react'

import { VideoList } from './_VideoList'
import { VideosTabs } from './_VideosTabs'

export default function VideosPage(): ReactElement {
  return (
    <>
      <VideosTabs />
      <VideoList />
    </>
  )
}
