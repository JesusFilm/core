import { ReactElement } from 'react'
import { Typography as MuiTypography } from '@mui/material'
import { GetJourney_journey_blocks_TypographyBlock as TypographyBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'

export function Typography({
  variant,
  color,
  align,
  content
}: TreeBlock<TypographyBlock>): ReactElement {
  return (
    <MuiTypography
      variant={variant ?? undefined}
      align={align ?? undefined}
      color={color ?? undefined}
      paragraph={variant === 'overline' || variant === 'caption'}
      gutterBottom
    >
      {content}
    </MuiTypography>
  )
}
