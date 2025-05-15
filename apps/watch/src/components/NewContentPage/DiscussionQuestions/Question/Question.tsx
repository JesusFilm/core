import MuiAccordion, { AccordionProps } from '@mui/material/Accordion'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import MuiAccordionSummary, {
  AccordionSummaryProps,
  accordionSummaryClasses
} from '@mui/material/AccordionSummary'
import { alpha, styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import ChevronDown from '@core/shared/ui/icons/ChevronDown'
import HelpSquareContained from '@core/shared/ui/icons/HelpSquareContained'

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} {...props} />
))(({ theme }) => ({
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0
  },
  '&::before': {
    display: 'none'
  },
  '&:hover': {
    bgcolor: 'white'
  }
}))

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ChevronDown sx={{ color: 'common.white' }} />}
    {...props}
  />
))(({ theme }) => ({
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.1)
  },
  [`& .${accordionSummaryClasses.content}`]: {
    marginLeft: theme.spacing(1)
  }
}))

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)'
}))

interface QuestionProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

export function Question({
  question,
  answer,
  isOpen,
  onToggle
}: QuestionProps): ReactElement {
  return (
    <Accordion
      expanded={isOpen}
      onChange={onToggle}
      sx={{
        bgcolor: 'transparent',
        color: 'common.white'
      }}
    >
      <AccordionSummary>
        <HelpSquareContained
          sx={{
            opacity: 0.2,
            mr: 6,
            mt: 1
          }}
        />
        <Typography sx={{ color: 'common.white' }}>{question}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography sx={{ color: 'common.white' }}>{answer}</Typography>
      </AccordionDetails>
    </Accordion>
  )
}
