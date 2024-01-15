import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import MuiAccordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'

interface AccordionProps {
  icon: ReactElement
  name?: string
  value: string
  description?: string
  expanded?: boolean
  onClick?: () => void
  testId?: string
  children: ReactNode
}

export function Accordion({
  icon,
  name,
  value,
  description,
  expanded,
  onClick,
  testId,
  children
}: AccordionProps): ReactElement {
  const { dispatch } = useEditor()

  const handleClick = (): void => {
    if (expanded !== true) {
      onClick?.()
    } else {
      dispatch({ type: 'SetSelectedAttributeIdAction', id: undefined })
    }
  }

  // need accordian details content
  // need accordianSummary content
  // get rid of border radius
  // needs a divider
  // remove elevation

  return (
    <MuiAccordion
      elevation={0}
      square
      disableGutters
      expanded={expanded}
      onChange={handleClick}
      sx={{ p: 0, '&.Mui-expanded:before': { opacity: 1 } }}
      onMouseDown={(e) => e.preventDefault()}
      data-testid={`JourneysAdminButton${testId ?? ''}`}
    >
      <AccordionSummary
        sx={{ p: 4, '.MuiAccordionSummary-content': { m: 0 } }}
        expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}
      >
        <Stack spacing={3} alignItems="center" direction="row">
          {icon}
          <Box sx={{ maxWidth: 92, overflow: 'hidden' }}>
            {name != null && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {name}
              </Typography>
            )}
            <Typography noWrap>{value !== '' ? value : 'None'}</Typography>
          </Box>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 5, pt: 0 }}>{children}</AccordionDetails>
    </MuiAccordion>
  )
}
