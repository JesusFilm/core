import { ReactElement, useState, useEffect } from 'react'
import { Button, Typography, useTheme } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'

import { BlockFields_StepBlock as StepBlock } from '../../../../__generated__/BlockFields'
import { CardPreview } from '../../CardPreview'
import { TreeBlock } from '@core/journeys/ui'

export interface CardOverviewProps {
  slug: string
  blocks?: Array<TreeBlock<StepBlock>>
}

const CardOverview = ({ slug, blocks }: CardOverviewProps): ReactElement => {
  const theme = useTheme()
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    const updateWidth = (): void => {
      setWidth(window.innerWidth)
    }

    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const stepBlockLength =
    blocks != null
      ? blocks.filter((block) => block.__typename === 'StepBlock').length
      : 0

  if (blocks != null && stepBlockLength > 1) {
    return (
      <>
        <CardPreview steps={blocks} />

        <Typography
          variant="body1"
          sx={{ pt: 2, flex: 1, textAlign: 'center' }}
        >
          {width > theme.breakpoints.values.md
            ? `${stepBlockLength} cards in this journey`
            : `${stepBlockLength} cards`}
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
