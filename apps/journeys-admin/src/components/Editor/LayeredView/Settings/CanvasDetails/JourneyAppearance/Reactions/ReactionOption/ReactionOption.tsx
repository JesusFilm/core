import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import type { ReactionFields, UpdateReactionInput } from '../Reactions'

interface ReactionOptionProps {
  title: string
  active: boolean
  handleToggle: (input: UpdateReactionInput) => void
  field: ReactionFields
}

export function ReactionOption({
  title,
  active,
  handleToggle,
  field
}: ReactionOptionProps): ReactElement {
  function handleChange(): void {
    handleToggle({ [field]: !active })
  }

  return (
    <Box sx={{ display: 'flex', px: 4, py: 2 }} data-testid="ReactionOption">
      <Checkbox
        data-testid={`checkbox-${title}`}
        checked={active}
        size="small"
        sx={{ p: 1, mr: 1 }}
        onChange={handleChange}
      />
      <Typography sx={{ my: 'auto' }}>{title}</Typography>
    </Box>
  )
}
