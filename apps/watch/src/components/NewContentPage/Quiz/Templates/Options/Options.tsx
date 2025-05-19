import Stack from '@mui/material/Stack'
import { useState } from 'react'

import { Action, ActionMetadata } from '../Action'

interface OptionsProps {
  actions: ActionMetadata[]
}

export function Options({ actions }: OptionsProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  return (
    <Stack
      className="Options"
      role="listbox"
      sx={{
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
        maxWidth: '48rem'
      }}
    >
      {actions.map((action, i) => (
        <Action key={i} idx={i} onHover={() => setHoveredIdx(i)} {...action} />
      ))}
    </Stack>
  )
}
