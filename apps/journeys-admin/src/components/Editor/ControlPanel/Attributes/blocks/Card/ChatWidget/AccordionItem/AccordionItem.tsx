import { ReactElement } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'

interface Props {
  title: string
  linkValue?: string
  active: boolean
  handleAction: () => void
  enableScript?: boolean
  type?: 'link' | 'script'
  scriptValue?: string
  enableIconSelect?: boolean
}

export function AccordionItem({
  title,
  linkValue,
  active,
  handleAction,
  enableScript = false,
  type,
  scriptValue,
  enableIconSelect = false
}: Props): ReactElement {
  return (
    <Accordion disableGutters>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack direction="column" spacing={8}>
          {enableScript && (
            <ToggleButtonGroup value={type} exclusive>
              <ToggleButton value="link">Link</ToggleButton>
              <ToggleButton value="script">Widget</ToggleButton>
            </ToggleButtonGroup>
          )}

          <TextField
            variant="outlined"
            placeholder={
              enableScript && type === 'script'
                ? 'Past URL here'
                : 'Past Page ID here'
            }
            value={enableScript && type === 'script' ? scriptValue : linkValue}
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}
