import { ReactElement } from 'react'

import { VideosTabs } from '../_VideosTabs'

import { AlgoliaVideoList } from './_AlgoliaVideoList'

export default function VideosAlgoliaPage(): ReactElement {
  return (
    <>
      <VideosTabs />
      <AlgoliaVideoList />
    </>
  )
}
