import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import MuiAccordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { ChangeEvent, ReactElement, ReactNode } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import { useEditor } from '@core/journeys/ui/EditorProvider'

interface AccordionProps {
  id: string
  icon: ReactElement
  name: string
  value?: string
  param?: string
  children: ReactNode
  switchProps?: {
    checked: boolean
    handleToggle: (e: ChangeEvent<HTMLInputElement>) => void
  }
}

export function Accordion({
  id,
  icon,
  name,
  value,
  param,
  children,
  switchProps
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
        void router.push({ query: { ...router.query, param } }, undefined, {
          shallow: true
        })
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
      onClick={(e) => e.stopPropagation()}
      sx={{ p: 0, '&.Mui-expanded:before': { opacity: 1 } }}
      data-testid={`Accordion-${id ?? ''}`}
    >
      <AccordionSummary
        sx={{ p: 4, '.MuiAccordionSummary-content': { m: 0 } }}
        expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}
        data-testid="AccordionSummary"
      >
        <Stack
          spacing={3}
          alignItems="center"
          direction="row"
          useFlexGap
          sx={{ width: '100%' }}
        >
          {icon}
          <Box sx={{ maxWidth: '24ch', overflow: 'hidden' }}>
            {value != null ? (
              <>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {name}
                </Typography>
                <Typography noWrap>{value !== '' ? value : 'None'}</Typography>
              </>
            ) : (
              <Typography variant="subtitle1" noWrap>
                {name}
              </Typography>
            )}
          </Box>
          {switchProps != null && (
            <Switch
              sx={{ ml: 'auto', justifySelf: 'flex-end' }}
              checked={switchProps.checked}
              onChange={switchProps.handleToggle}
              onClick={(e) => e.stopPropagation()}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          )}
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>{children}</AccordionDetails>
    </MuiAccordion>
  )
}
