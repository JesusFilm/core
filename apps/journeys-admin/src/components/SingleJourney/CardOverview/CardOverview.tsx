import { ReactElement } from 'react'
import { Typography, Fab, Card, Box } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos'

import { BlockFields_StepBlock as StepBlock } from '../../../../__generated__/BlockFields'
import { CardPreview } from '../../CardPreview'
import { TreeBlock } from '@core/journeys/ui'
import { useBreakpoints } from '@core/shared/ui'

export interface CardOverviewProps {
  slug: string
  blocks: Array<TreeBlock<StepBlock>>
}

const CardOverview = ({ slug, blocks }: CardOverviewProps): ReactElement => {
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
              position: 'absolute',
              bottom: 3,
              right: '17px'
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
            sx={{
              width: '89px',
              height: '134px'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                pt: 11
              }}
            >
              <AddToPhotosIcon color="primary" />
              <Typography
                align="center"
                sx={{
                  fontFamily: 'Open Sans',
                  fontWeight: '400px',
                  lineHeight: 4,
                  fontSize: '12px',
                  color: 'text.secondary'
                }}
              >
                Add a Card
              </Typography>
            </Box>
          </Card>
        </Box>
      )}
      <Typography variant="body1" sx={{ pt: 2, textAlign: 'center' }}>
        {stepBlockLength > 0
          ? breakpoints.md
            ? `${cardNumber} in this journey`
            : `${cardNumber}`
          : 'No cards'}
      </Typography>
    </>
  )
}

export default CardOverview
