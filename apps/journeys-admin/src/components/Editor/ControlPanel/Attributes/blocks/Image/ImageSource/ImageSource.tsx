import { ReactElement } from 'react'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import { ImageSelection } from '../../../../../ImageLibrary/ImageSelection/ImageSelection'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../../../__generated__/GetJourney'

export interface ImageSourceProps {
  image?: ImageBlock
  onClick?: () => void
}

export function ImageSource({
  image,
  onClick
}: ImageSourceProps): ReactElement {
  return (
    <Card
      variant="outlined"
      sx={{
        width: 285,
        height: 78,
        borderRadius: 2
      }}
    >
      <CardActionArea
        data-testid="card click area"
        onClick={onClick}
        sx={{
          height: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
          display: 'flex'
        }}
      >
        <ImageSelection
          image={image}
          startPanel={{
            name: 'source',
            heading: 'Select image',
            hasImage: false
          }}
        />
      </CardActionArea>
    </Card>
  )
}
