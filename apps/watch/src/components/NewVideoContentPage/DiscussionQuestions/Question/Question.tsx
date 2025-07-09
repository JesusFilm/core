import MuiAccordion, { AccordionProps } from '@mui/material/Accordion'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import MuiAccordionSummary, {
  AccordionSummaryProps,
  accordionSummaryClasses
} from '@mui/material/AccordionSummary'
import { alpha, styled } from '@mui/material/styles'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import ChevronDown from '@core/shared/ui/icons/ChevronDown'
import HelpSquareContained from '@core/shared/ui/icons/HelpSquareContained'
import Mail1 from '@core/shared/ui/icons/Mail1'
import MessageCircle from '@core/shared/ui/icons/MessageCircle'

import { Button } from '../../../Button'

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} {...props} />
))(({ theme }) => ({
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': { borderBottom: 0 },
  '&::before': { display: 'none' },
  '&:hover': { bgcolor: 'white' }
}))

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ChevronDown sx={{ color: 'common.white' }} />}
    {...props}
  />
))(({ theme }) => ({
  '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.1) },
  [`& .${accordionSummaryClasses.content}`]: { marginLeft: theme.spacing(1) }
}))

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)'
}))

interface QuestionProps {
  question: string
  isOpen: boolean
  onToggle: () => void
}

export function Question({
  question,
  isOpen,
  onToggle
}: QuestionProps): ReactElement {
  const { t } = useTranslation('apps-watch')

  return (
    <Accordion
      expanded={isOpen}
      onChange={onToggle}
      sx={{ bgcolor: 'transparent', borderWidth: 0 }}
    >
      <AccordionSummary>
        <HelpSquareContained
          sx={{ opacity: 0.2, mr: 6, mt: 1, color: 'common.white' }}
        />
        <h3 className="text-md md:text-lg font-semibold text-stone-100 sm:pr-4 md:text-balance leading-[1.6]">
          {question}
        </h3>
      </AccordionSummary>
      <AccordionDetails>
        <p className="text-stone-200/80">
          {t('Have a private discussion with someone who is ready to listen.')}
        </p>
        <div className="pt-4 flex items-center">
          <Button
            onClick={() =>
              window.open(
                'https://chataboutjesus.com/chat/?utm_source=jesusfilm-watch',
                '_blank'
              )
            }
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-gray-900 font-bold text-xs uppercase tracking-wider transition-colors duration-200 hover:bg-[#cb333b] hover:text-white cursor-pointer mr-4"
          >
            <MessageCircle className="w-4 h-4" />
            {t('Chat with a person')}
          </Button>
          <Button
            onClick={() =>
              window.open(
                'https://www.everystudent.com/contact.php?utm_source=jesusfilm-watch',
                '_blank'
              )
            }
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-gray-900 font-bold text-xs uppercase tracking-wider transition-colors duration-200 hover:bg-[#cb333b] hover:text-white cursor-pointer"
          >
            <Mail1 className="w-4 h-4" />
            {t('Ask a Bible question')}
          </Button>
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
