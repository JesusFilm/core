import { ReactElement } from 'react'
import Img from 'next/image'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'

export function Image({
  src,
  alt,
  height,
  width
}: TreeBlock<ImageBlock>): ReactElement {
  return (
    <Img
      src={src}
      alt={alt}
      height={height}
      width={width}
      layout="responsive"
    />
  )
}
