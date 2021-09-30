import { ReactElement } from 'react'
import NextImage from 'next/image'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'

export function Image({
  src,
  alt,
  height,
  width
}: TreeBlock<ImageBlock>): ReactElement {
  return (
    <NextImage
      src={src}
      alt={alt}
      height={height}
      width={width}
      layout="responsive"
    />
  )
}
