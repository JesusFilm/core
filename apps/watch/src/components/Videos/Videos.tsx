import { ReactElement } from 'react'
import { VideoType } from '../../../__generated__/globalTypes'
import { VideoList } from './VideoList/VideoList'

export function Videos(): ReactElement {
  return (
    <VideoList
      filter={{
        availableVariantLanguageIds: ['529'],
        types: [VideoType.playlist, VideoType.standalone]
      }}
      layout="grid"
    />
  )
}
