import { ReactElement } from 'react'

import HelpSquareContained from '@core/shared/ui/icons/HelpSquareContained'
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion'
import MuiAccordionSummary, {
  AccordionSummaryProps,
  accordionSummaryClasses
} from '@mui/material/AccordionSummary'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import { styled, alpha } from '@mui/material/styles'
import ChevronDown from '@core/shared/ui/icons/ChevronDown'

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

  return (
    <>
      <button
        onClick={onToggle}
        className="w-full text-left group hover:bg-white/5 py-3 transition-colors cursor-pointer padded rounded-lg"
      >
        <div className="w-full">
          <div className="flex items-top justify-between">
            <p className="text-md md:text-lg font-semibold text-stone-100 sm:pr-4 md:text-balance leading-[1.6] flex ">
              <HelpSquareContained
                sx={{
                  opacity: 0.2,
                  mr: 6,
                  mt: 1
                }}
              />{' '}
              {question}
            </p>
            <div className="p-2 text-stone-400 group-hover:text-white transition-colors flex hidden sm:block">
              <svg
                className={`w-6 h-6 transform transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"
                />
              </svg>
            </div>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="padded py-6 pb-12 text-stone-200/80 border-b border-stone-500/20">
          {answer}
        </div>
      )}
    </>
  )
}
