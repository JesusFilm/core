import Box from '@mui/material/Box'
import { ReactElement } from 'react'

interface GridVariantProps {
  options: (ReactElement | false)[]
  addOption?: ReactElement
  blockId: string
}

export function GridVariant({
  options,
  addOption,
  blockId
}: GridVariantProps): ReactElement {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 2,
        marginBottom: 4
      }}
      data-testid={`JourneysRadioQuestionGrid-${blockId}`}
    >
      {options.map((option, index) => (
        <Box key={index}>{option}</Box>
      ))}
      {addOption && <Box>{addOption}</Box>}
    </Box>
  )
}
