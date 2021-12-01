import { TreeBlock } from '@core/journeys/ui'
import {
  Card as MuiCard,
  CardActionArea,
  CardContent,
  Typography
} from '@mui/material'
import { ReactElement } from 'react'
import { GetJourneyForEdit_journey_blocks_CardBlock as CardBlock } from '../../../../../../../__generated__/GetJourneyForEdit'

export function Card({ id }: TreeBlock<CardBlock>): ReactElement {
  return (
    <>
      {id}
      <MuiCard sx={{ maxWidth: 345 }}>
        <CardActionArea>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              Lizard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lizards are a widespread group of squamate reptiles, with over
              6,000 species, ranging across all continents except Antarctica
            </Typography>
          </CardContent>
        </CardActionArea>
      </MuiCard>
    </>
  )
}
