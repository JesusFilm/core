import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import { ReactElement } from 'react'

import Image3Icon from '@core/shared/ui/icons/Image3'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../../__generated__/GetJourney'
import { ImageBlockHeader } from '../../../../ImageBlockHeader'

interface SmallProps {
  loading?: boolean
  imageBlock?: ImageBlock | null
  onClick?: () => void
}

export function Small({
  loading,
  imageBlock,
  onClick
}: SmallProps): ReactElement {
  return (
    <Card
      variant="outlined"
      sx={{
        border: 0,
        borderRadius: 2,
        backgroundColor: 'background.default'
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
        <ImageBlockHeader
          selectedBlock={imageBlock ?? null}
          showAdd
          showTitle={false}
          Icon={Image3Icon}
        />
      </CardActionArea>
    </Card>
  )
}
