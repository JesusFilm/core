import { TreeBlock } from '@core/journeys/ui'
import { Stack } from '@mui/material'
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
  selected: TreeBlock
}

export function Attributes({ selected }: AttributesProps): ReactElement {
  return (
    <Stack
      direction="row"
      spacing={4}
      sx={{
        overflowX: 'auto',
        py: 5,
        px: 6
      }}
    >
      <AttributesContent selected={selected} />
    </Stack>
  )
}
