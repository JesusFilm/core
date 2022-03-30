import { ReactElement } from 'react'
import { VideoList } from './VideoList/VideoList'

export function Videos(): ReactElement {
  return (
    <VideoList
      filter={{ availableVariantLanguageIds: ['529'] }}
      layout="carousel"
    />
  )
}
