import { TreeBlock } from '../../../libs/transformer/transformer'
import { ReactElement } from 'react'
import { BlockRenderer } from '../../BlockRenderer'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../__generated__/GetJourney'
import Img from 'next/image'
import Box from '@mui/material/Box'

export function Card({ children, imgSrc, fontColor, backgroundColor }: TreeBlock<CardBlock>): ReactElement {
  return (
    <Box sx={{
      width: 500,
      minWidth: 400,
      padding: '2em',
      maxWidth: '100%',
      borderRadius: '2em',
      backgroundColor: backgroundColor,
      color: fontColor
    }}>
      {(imgSrc != null) && <Img src={imgSrc} layout="fill" />}
      {children?.map((block) => (
        <BlockRenderer {...block} key={block.id} />
      ))}
    </Box>
  )
}
