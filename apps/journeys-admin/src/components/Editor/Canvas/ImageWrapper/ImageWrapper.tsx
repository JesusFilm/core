import { ReactElement } from 'react'
import { Image } from '@core/journeys/ui'
import type { WrapperProps } from '@core/journeys/ui'

export function ImageWrapper({ block }: WrapperProps): ReactElement {
  return block.__typename === 'ImageBlock' ? (
    <Image
      {...{
        ...block,
        blurhash: '',
        alt: ''
      }}
    />
  ) : (
    <></>
  )
}
