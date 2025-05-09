import { ReactElement, useState } from 'react'

import MessageCircle from '@core/shared/ui/icons/MessageCircle'
import { useTranslation } from 'next-i18next'

import { Question } from './Question'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { VideoContentFields_studyQuestions } from '../../../../__generated__/VideoContentFields'

interface DiscussionQuestionProps {
  questions: VideoContentFields_studyQuestions[]
}

export function DiscussionQuestions({
  questions
}: DiscussionQuestionProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const [openQuestion, setOpenQuestion] = useState<number | null>(null)

  const handleQuestionToggle = (idx: number): void => {
    setOpenQuestion(openQuestion === idx ? null : idx)
  }

  const handleAskQuestionClick = (): void => {
    window.open(
      'https://issuesiface.com/talk?utm_source=jesusfilm-watch',
      '_blank'
    )
  }

  return (
    <Box data-testid="DiscussionQuestions">
      <Box sx={{ pt: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 6,
            px: 2
          }}
        >
          <Typography variant="overline2">{t('Related questions')}</Typography>
          <a
            href="https://issuesiface.com/talk?utm_source=jesusfilm-watch"
            target="_blank"
          >
            <Button
              size="xsmall"
              onClick={handleAskQuestionClick}
              data-testid="AskQuestionButton"
              rel="noopener noreferrer"
              aria-label={t('Ask a question')}
              tabIndex={0}
              startIcon={<MessageCircle sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: '64px',
                color: 'text.primary',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                bgcolor: 'white',
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'common.white'
                },
                transition: 'colors 0.2s'
              }}
            >
              {t('Ask yours')}
            </Button>
          </a>
        </Box>

        <Box sx={{ position: 'relative' }}>
          {questions.map((q, i) => (
            <Question
              key={i}
              question={q.value}
              isOpen={i === openQuestion}
              onToggle={() => handleQuestionToggle(i)}
              answer={t(
                'Process what you learned -- Have a private discussion with someone who is ready to listen.'
              )}
            />
          ))}
        </Box>
      </Box>
    </Box>
  )
}
