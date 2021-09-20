import { ReactElement } from 'react'
import Img from 'next/image'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'

export function Image({
  src,
  width,
  height,
  alt
}: TreeBlock<ImageBlock>): ReactElement {
  return (
    <Img
      src={src}
      alt={alt === null ? undefined : alt}
      width={width}
      height={height}
    />
  )
}
