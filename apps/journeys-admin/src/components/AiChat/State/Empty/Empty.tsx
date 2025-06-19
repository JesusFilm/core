import { Message, UseChatHelpers } from '@ai-sdk/react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface StateEmptyProps {
  messages: Message[]
  append: UseChatHelpers['append']
}

export function StateEmpty({
  messages,
  append
}: StateEmptyProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')

  return messages.length === 0 ? (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
          flexWrap: 'wrap'
        }}
      >
        <Chip
          label={t('Customize my journey')}
          size="small"
          variant="outlined"
          onClick={() => {
            void append({
              role: 'user',
              content: 'Help me customize my journey.'
            })
          }}
        />
        <Chip
          label={t('Translate to another language')}
          size="small"
          variant="outlined"
          onClick={() => {
            void append({
              role: 'user',
              content: 'Help me to translate my journey to another language.'
            })
          }}
        />
        <Chip
          label={t('Tell me about my journey')}
          size="small"
          variant="outlined"
          onClick={() => {
            void append({
              role: 'user',
              content: 'Tell me about my journey.'
            })
          }}
        />
        <Chip
          label={t('What can I do to improve my journey?')}
          size="small"
          variant="outlined"
          onClick={() => {
            void append({
              role: 'user',
              content: 'What can I do to improve my journey?'
            })
          }}
        />
      </Box>
      <Typography
        variant="body1"
        textAlign="center"
        color="text.secondary"
        sx={{
          mb: 2,
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {t('NextSteps AI can help you make your journey more effective!')}
        <br />
        {t('Ask it anything.')}
      </Typography>
    </>
  ) : null
}
