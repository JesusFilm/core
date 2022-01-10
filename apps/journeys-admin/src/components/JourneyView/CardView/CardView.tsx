import { ReactElement } from 'react'
import { Typography, Fab, Card, Box } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import { TreeBlock } from '@core/journeys/ui'
import { useBreakpoints } from '@core/shared/ui'
import { BlockFields_StepBlock as StepBlock } from '../../../../__generated__/BlockFields'
import { CardPreview } from '../../CardPreview'

export interface CardViewProps {
  slug: string
  blocks: Array<TreeBlock<StepBlock>>
}

export function CardView({ slug, blocks }: CardViewProps): ReactElement {
  const breakpoints = useBreakpoints()

  const stepBlockLength =
    blocks?.filter((block) => block.__typename === 'StepBlock').length ?? 0

  const cardNumber =
    stepBlockLength === 1
      ? `${stepBlockLength} card`
      : `${stepBlockLength} cards`

  return (
    <>
      {stepBlockLength > 0 ? (
        <>
          <CardPreview steps={blocks} />

          <Fab
            variant="extended"
            size="medium"
            sx={{
              position: 'fixed',
              bottom: '12px',
              right: '16px'
            }}
            color="primary"
            href={`/journeys/${slug}/edit`}
          >
            <EditIcon sx={{ mr: 1 }} />
            Edit
          </Fab>
        </>
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 6,
            mb: 8
          }}
        >
          <Card
            variant="outlined"
            aria-label="add-card"
            sx={{
              width: '89px',
              height: '134px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <AddIcon color="primary" />
          </Card>
        </Box>
      )}
      <Typography variant="body1" sx={{ pt: 2, textAlign: 'center' }}>
        {stepBlockLength > 0
          ? breakpoints.md
            ? `${cardNumber} in this journey`
            : `${cardNumber}`
          : 'Select Empty Card to add'}
      </Typography>
    </>
  )
}
