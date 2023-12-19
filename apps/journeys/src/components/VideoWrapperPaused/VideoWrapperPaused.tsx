import { ReactElement } from 'react'

import { WrapperProps } from '@core/journeys/ui/BlockRenderer'
import { Video } from '@core/journeys/ui/Video'

export function VideoWrapperPaused({ block }: WrapperProps): ReactElement {
  return block.__typename === 'VideoBlock' ? (
    <Video
      {...{
        ...block,
        videoId: null
      }}
    />
  ) : (
    <></>
  )
}
