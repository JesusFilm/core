import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import MuiLink from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

interface HeaderLinkAccordionProps {
  label: string
  url?: string
  expanded?: boolean
  onAccordionChange?: (
    panel: string
  ) => (event: React.SyntheticEvent, isExpanded: boolean) => void
  subLinks?: Array<{
    url: string
    label: string
  }>
  onClose: () => void
}

export function HeaderLinkAccordion({
  label,
  url,
  expanded,
  onAccordionChange,
  subLinks,
  onClose
}: HeaderLinkAccordionProps): ReactElement {
  if (!subLinks?.length) {
    return (
      <Stack alignItems="flex-end">
        <MuiLink
          href={url}
          underline="none"
          rel="noopener"
          color="text.secondary"
          onClick={onClose}
          sx={{ fontSize: { xs: 30, sm: 38 }, fontWeight: 700 }}
        >
          {label}
        </MuiLink>
      </Stack>
    )
  }

  return (
    <Accordion
      expanded={expanded}
      onChange={onAccordionChange?.(label)}
      elevation={0}
      disableGutters
      sx={{
        '&:before': {
          display: 'none'
        },
        backgroundColor: 'transparent'
      }}
    >
      <AccordionSummary
        expandIcon={null}
        aria-controls={`${label}-content`}
        sx={{
          p: 0,
          minHeight: '0 !important',
          '& .MuiAccordionSummary-content': {
            justifyContent: 'flex-end',
            margin: '0 !important'
          }
        }}
      >
        <Typography
          color="text.secondary"
          sx={{ fontSize: { xs: 30, sm: 38 }, fontWeight: 700 }}
        >
          {label}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0, py: 8 }}>
        <Stack spacing={2} alignItems="flex-end">
          {subLinks.map((subLink) => (
            <MuiLink
              key={subLink.label}
              href={subLink.url}
              underline="none"
              rel="noopener"
              color="text.secondary"
              onClick={onClose}
              sx={{ fontSize: { xs: 22, sm: 27 }, fontWeight: 'bold' }}
            >
              {subLink.label}
            </MuiLink>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}
