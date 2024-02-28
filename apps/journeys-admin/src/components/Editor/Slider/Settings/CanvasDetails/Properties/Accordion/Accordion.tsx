import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import MuiAccordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { ReactElement, ReactNode } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'

import { setBeaconPageViewed } from '../../../../../../../libs/setBeaconPageViewed'

interface AccordionProps {
  id: string
  icon: ReactElement
  name: string
  value: string
  testId?: string
  param?: string
  children: ReactNode
}

export function Accordion({
  id,
  icon,
  name,
  value,
  testId,
  param,
  children
}: AccordionProps): ReactElement {
  const router = useRouter()
  const {
    state: { selectedAttributeId },
    dispatch
  } = useEditor()
  const expanded = id === selectedAttributeId

  const handleClick = (): void => {
    if (!expanded) {
      dispatch({
        type: 'SetSelectedAttributeIdAction',
        selectedAttributeId: id
      })
      if (param != null) {
        router.query.param = param
        void router.push(router)
        router.events.on('routeChangeComplete', () => {
          setBeaconPageViewed(param)
        })
      }
    } else {
      dispatch({
        type: 'SetSelectedAttributeIdAction'
      })
    }
  }

  return (
    <MuiAccordion
      elevation={0}
      square
      disableGutters
      expanded={expanded}
      onChange={handleClick}
      sx={{ p: 0, '&.Mui-expanded:before': { opacity: 1 } }}
      onMouseDown={(e) => e.preventDefault()}
      data-testid={`Accordion-${id ?? ''}`}
    >
      <AccordionSummary
        sx={{ p: 4, '.MuiAccordionSummary-content': { m: 0 } }}
        expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}
        data-testid="AccordionSummary"
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
      <AccordionDetails sx={{ p: 0 }}>{children}</AccordionDetails>
    </MuiAccordion>
  )
}
