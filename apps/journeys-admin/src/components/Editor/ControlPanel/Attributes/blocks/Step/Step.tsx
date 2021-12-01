import { TreeBlock } from '@core/journeys/ui'
import {
  Card as MuiCard,
  CardActionArea,
  CardContent,
  Typography
} from '@mui/material'
import { ReactElement } from 'react'
import { GetJourneyForEdit_journey_blocks_StepBlock as StepBlock } from '../../../../../../../__generated__/GetJourneyForEdit'

export function Step({ id }: TreeBlock<StepBlock>): ReactElement {
  return (
    <>
      <MuiCard
        sx={{
          maxWidth: 130
        }}
        variant="outlined"
      >
        <CardActionArea>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Next Card
            </Typography>
            <Typography gutterBottom variant="h5" component="div">
              Card Title...
            </Typography>
          </CardContent>
        </CardActionArea>
      </MuiCard>
    </>
  )
}
