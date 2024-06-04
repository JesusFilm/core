import { ReactElement } from 'react'

import type { WrapperProps } from '@core/journeys/ui/BlockRenderer'
import { Video } from '@core/journeys/ui/Video'

export function VideoWrapper({ block }: WrapperProps): ReactElement {
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
