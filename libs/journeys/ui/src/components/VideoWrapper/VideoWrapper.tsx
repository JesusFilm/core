import { ReactElement } from 'react'

import type { WrapperProps } from '../BlockRenderer'
import { Video } from '../Video'

export function VideoWrapper({ block }: WrapperProps): ReactElement {
  console.log('VideoWrapper', block)
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
