import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import MuiAccordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, ReactNode } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import { useEditor } from '@core/journeys/ui/EditorProvider'

interface AccordionProps {
  id: string
  icon: ReactElement
  name: string
  value?: string
  param?: string
  children: ReactNode
  disabled?: boolean
}

export function Accordion({
  id,
  icon,
  name,
  value,
  param,
  children,
  disabled = false
}: AccordionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
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
      sx={{
        p: 0,
        '&.Mui-expanded:before': { opacity: 1 },
        '&.Mui-disabled': {
          pointerEvents: 'none',
          backgroundColor: 'transparent'
        }
      }}
      data-testid={`Accordion-${id ?? ''}`}
      disabled={disabled}
    >
      <AccordionSummary
        sx={{ p: 4, '.MuiAccordionSummary-content': { m: 0 } }}
        expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}
        data-testid="AccordionSummary"
      >
        <Stack spacing={3} alignItems="center" direction="row">
          {icon}
          <Box sx={{ maxWidth: '24ch', overflow: 'hidden' }}>
            {value != null ? (
              <>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {name}
                </Typography>
                <Typography noWrap>{value !== '' ? t(value) : t('None')}</Typography>
              </>
            ) : (
              <Typography variant="body1" noWrap>
                {name}
              </Typography>
            )}
          </Box>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>{children}</AccordionDetails>
    </MuiAccordion>
  )
}
