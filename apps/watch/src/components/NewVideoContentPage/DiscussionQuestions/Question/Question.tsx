import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import HelpSquareContained from '@core/shared/ui/icons/HelpSquareContained'
import Mail1 from '@core/shared/ui/icons/Mail1'
import MessageCircle from '@core/shared/ui/icons/MessageCircle'

import { VideoContentFields_studyQuestions as StudyQuestions } from '../../../../../__generated__/VideoContentFields'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../../../Accordion'
import { Button } from '../../../Button'

interface QuestionProps {
  questions: StudyQuestions[]
}

export function Question({ questions }: QuestionProps): ReactElement {
  const { t } = useTranslation('apps-watch')

  return (
    <Accordion type="single" collapsible className="w-full">
      {questions.map((q, i) => (
        <AccordionItem key={i} value={i.toString()} className="border-0">
          <AccordionTrigger className="rounded-lg px-7 hover:bg-white/10 hover:no-underline [&>svg]:text-white">
            <div className="flex items-start text-left">
              <HelpSquareContained
                sx={{ opacity: 0.2, mr: 6, mt: 1, color: 'common.white' }}
              />
              <h3 className="text-md leading-[1.6] font-semibold text-stone-100 sm:pr-4 md:text-lg md:text-balance">
                {q.value}
              </h3>
            </div>
          </AccordionTrigger>
          <AccordionContent className="transition-all duration-300">
            <div className="pr-4 pl-[72px]">
              <p className="text-stone-200/80">
                {t(
                  'Have a private discussion with someone who is ready to listen.'
                )}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-4 md:flex-nowrap md:gap-0">
                <Button
                  onClick={() =>
                    window.open(
                      'https://chataboutjesus.com/chat/?utm_source=jesusfilm-watch',
                      '_blank'
                    )
                  }
                  className="mr-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold tracking-wider text-gray-900 uppercase transition-colors duration-200 hover:bg-[#cb333b] hover:text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t('Chat with a person')}
                </Button>
                <Button
                  onClick={() =>
                    window.open(
                      'https://www.everystudent.com/contact.php?utm_source=jesusfilm-watch',
                      '_blank'
                    )
                  }
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold tracking-wider text-gray-900 uppercase transition-colors duration-200 hover:bg-[#cb333b] hover:text-white"
                >
                  <Mail1 className="h-4 w-4" />
                  {t('Ask a Bible question')}
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
