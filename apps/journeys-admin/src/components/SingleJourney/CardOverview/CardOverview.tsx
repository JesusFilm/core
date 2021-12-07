import { ReactElement } from 'react'
import { Button, Box, Typography } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'

import { BlockFields_StepBlock as StepBlock } from '../../../../__generated__/BlockFields'
import { CardPreview } from '../../CardPreview'
import { TreeBlock } from '@core/journeys/ui'

export interface CardOverviewProps {
  slug: string
  blocks?: Array<TreeBlock<StepBlock>>
}

const CardOverview = ({ slug, blocks }: CardOverviewProps): ReactElement => {
  return (
    <Box>
      <Typography variant="h4">Cards</Typography>
      {blocks != null && <CardPreview steps={blocks} />}

      <Button
        variant="contained"
        startIcon={<EditIcon />}
        sx={{ backgroundColor: '#C52D3A', borderRadius: '20px' }}
        href={`/journeys/${slug}/edit`}
      >
        Edit
      </Button>
    </Box>
  )
}

export default CardOverview
