import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Typography from '@mui/material/Typography'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { type ReactElement } from 'react'

interface RefinementGroupProps {
  title: string
  refinement: RefinementListRenderState
}

export function RefinementGroup({
  title,
  refinement
}: RefinementGroupProps): ReactElement {
  const { items, refine } = refinement
  return (
    <Box>
      <Typography variant="h6" color="primary.main" marginBottom={6}>
        {title}
      </Typography>
      <Box color="text.primary">
        {items.length > 0 ? (
          <FormGroup>
            {items.map((item) => (
              <FormControlLabel
                key={item.value}
                control={
                  <Checkbox
                    checked={item.isRefined}
                    onClick={() => refine(item.value)}
                    size="small"
                  />
                }
                label={item.label}
              />
            ))}
          </FormGroup>
        ) : (
          <></>
        )}
      </Box>
    </Box>
  )
}
