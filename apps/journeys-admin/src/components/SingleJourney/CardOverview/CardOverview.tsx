import { ReactElement } from 'react'
import { Button, Typography, useTheme } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'

import { BlockFields_StepBlock as StepBlock } from '../../../../__generated__/BlockFields'
import { CardPreview } from '../../CardPreview'
import { TreeBlock } from '@core/journeys/ui'
import { useBreakpoints } from '@core/shared/ui'

export interface CardOverviewProps {
  slug: string
  blocks?: Array<TreeBlock<StepBlock>>
}

const CardOverview = ({ slug, blocks }: CardOverviewProps): ReactElement => {
  const theme = useTheme()
  const breakpoints = useBreakpoints()

  const stepBlockLength =
    blocks?.filter((block) => block.__typename === 'StepBlock').length ?? 0

  const cardNumber =
    stepBlockLength === 1
      ? `${stepBlockLength} card`
      : `${stepBlockLength} cards`

  if (blocks != null && stepBlockLength >= 1) {
    return (
      <>
        <CardPreview steps={blocks} />

        <Typography
          variant="body1"
          sx={{ pt: 2, flex: 1, textAlign: 'center' }}
        >
          {breakpoints.md ? `${cardNumber} in this journey` : `${cardNumber}`}
        </Typography>

        <Button
          variant="contained"
          startIcon={<EditIcon />}
          sx={{
            backgroundColor: theme.palette.primary.main,
            borderRadius: '20px',
            position: 'absolute',
            bottom: '12px',
            right: '17px'
          }}
          href={`/journeys/${slug}/edit`}
        >
          Edit
        </Button>
      </>
    )
  } else {
    return (
      <Typography variant="h6" sx={{ pt: 2, flex: 1, textAlign: 'center' }}>
        No cards in this journey
      </Typography>
    )
  }
}

export default CardOverview
