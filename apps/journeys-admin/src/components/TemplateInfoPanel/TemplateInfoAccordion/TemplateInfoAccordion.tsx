import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import MuiAccordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'

interface TemplateInfoAccordionProps {
  /** Stable identifier used for `aria-controls` and parent-controlled state. */
  id: string
  /** Visible accordion title (passed through `t()` by the caller). */
  title: string
  /** Whether this accordion is currently expanded. Owned by the parent. */
  expanded: boolean
  /** Called when the user clicks the summary. Receives the next expanded state. */
  onChange: (nextExpanded: boolean) => void
  children: ReactNode
  /** Whether this row is the last in the list — drops the bottom divider. */
  isLast?: boolean
}

/**
 * Generic single-row accordion used by `TemplateInfoPanel`. The component is
 * fully controlled: the parent owns `expanded` so it can enforce single-expand
 * semantics across the panel's sections. Visual styling matches Figma
 * `39653-66422` and its expanded-state siblings (Subtitle/1 token, 20px padding,
 * 1px `#DEDFE0` divider beneath every row except the last).
 */
export function TemplateInfoAccordion({
  id,
  title,
  expanded,
  onChange,
  children,
  isLast = false
}: TemplateInfoAccordionProps): ReactElement {
  function handleChange(): void {
    onChange(!expanded)
  }

  return (
    <MuiAccordion
      elevation={0}
      square
      disableGutters
      expanded={expanded}
      onChange={handleChange}
      data-testid={`TemplateInfoAccordion-${id}`}
      sx={{
        width: '100%',
        bgcolor: 'transparent',
        borderBottom: isLast ? 'none' : '1px solid',
        borderColor: 'divider',
        '&:before': { display: 'none' },
        '&.Mui-expanded': { margin: 0 }
      }}
    >
      <AccordionSummary
        id={`template-info-accordion-summary-${id}`}
        aria-controls={`template-info-accordion-content-${id}`}
        expandIcon={<ExpandMoreIcon sx={{ color: 'text.primary' }} />}
        sx={{
          p: 2.5,
          minHeight: 0,
          '&.Mui-expanded': { minHeight: 0 },
          '.MuiAccordionSummary-content': { m: 0 },
          '.MuiAccordionSummary-content.Mui-expanded': { m: 0 }
        }}
      >
        <Typography
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            fontSize: 18,
            lineHeight: '24px',
            color: 'text.primary'
          }}
        >
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2.5 }}>
        {children}
      </AccordionDetails>
    </MuiAccordion>
  )
}
