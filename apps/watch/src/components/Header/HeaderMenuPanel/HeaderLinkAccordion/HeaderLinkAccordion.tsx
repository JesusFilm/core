import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
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
      <Stack alignItems="flex-end" sx={{ pr: 8 }}>
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
    <Box
      sx={{
        pr: 8,
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '100%',
          width: '100vw',
          backgroundColor: 'background.default'
        }
      }}
    >
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
            minHeight: '0 !important',
            padding: 0,
            '& .MuiAccordionSummary-content': {
              justifyContent: 'flex-end',
              margin: '0 !important'
            }
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: 30, sm: 38 },
              fontWeight: 700,
              color: expanded ? 'primary.main' : 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
          >
            {label}
          </Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            my: 2,
            px: 0,
            py: { xs: 4, sm: 8 },
            backgroundColor: '#F5F4ED',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: { xs: 47.5, sm: 58 },
              bottom: 8,
              left: '100%',
              width: '100vw',
              backgroundColor: '#F5F4ED',
              zIndex: 1
            }
          }}
        >
          <Stack spacing={2} alignItems="flex-end">
            {subLinks.map((subLink) => (
              <MuiLink
                key={subLink.label}
                href={subLink.url}
                underline="none"
                rel="noopener"
                color="text.secondary"
                onClick={onClose}
                sx={{
                  fontSize: { xs: 22, sm: 27 },
                  fontWeight: 'bold',
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
              >
                {subLink.label}
              </MuiLink>
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}
