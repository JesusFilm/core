import { ReactElement } from 'react'
import { Video } from '@core/journeys/ui/Video'
import type { WrapperProps } from '@core/journeys/ui/BlockRenderer'

export function VideoWrapper({ block }: WrapperProps): ReactElement {
  // getting admin to run
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
