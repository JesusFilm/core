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
          <AccordionTrigger className="hover:no-underline [&>svg]:text-white hover:bg-white/10 rounded-lg px-7 hover:cursor-pointer">
            <div className="flex items-start text-left">
              <HelpSquareContained
                sx={{ opacity: 0.2, mr: 6, mt: 1, color: 'common.white' }}
              />
              <h3 className="text-md md:text-lg font-semibold text-stone-100 sm:pr-4 md:text-balance leading-[1.6]">
                {q.value}
              </h3>
            </div>
          </AccordionTrigger>
          <AccordionContent className="transition-all duration-300">
            <div className="pl-[72px] pr-4">
              <p className="text-stone-200/80">
                {t(
                  'Have a private discussion with someone who is ready to listen.'
                )}
              </p>
              <div className="pt-4 flex items-center flex-wrap gap-2 md:flex-nowrap md:gap-0">
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
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
