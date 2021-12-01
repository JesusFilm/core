import { TreeBlock } from '@core/journeys/ui'
import { Box } from '@mui/material'
import { ReactElement } from 'react'
import { Card, Step } from './blocks'

function AttributesContent({ selected }: AttributesProps): ReactElement {
  switch (selected?.__typename) {
    case 'CardBlock':
      return <Card {...selected} />
    case 'StepBlock':
      return <Step {...selected} />
    default:
      return <></>
  }
}

interface AttributesProps {
  selected?: TreeBlock
}

export function Attributes({ selected }: AttributesProps): ReactElement {
  return (
    <Box sx={{ backgroundColor: '#EFEFEF', p: 5 }}>
      <AttributesContent selected={selected} />
    </Box>
  )
}
