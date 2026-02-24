import { UIMessage } from 'ai'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface StateEmptyProps {
  messages: UIMessage[]
  onSendMessage: (text: string) => void
}

export function StateEmpty({
  messages,
  onSendMessage
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
          onClick={() => onSendMessage('Help me customize my journey.')}
        />
        <Chip
          label={t('Translate to another language')}
          size="small"
          variant="outlined"
          onClick={() =>
            onSendMessage(
              'Help me to translate my journey to another language.'
            )
          }
        />
        <Chip
          label={t('Tell me about my journey')}
          size="small"
          variant="outlined"
          onClick={() => onSendMessage('Tell me about my journey.')}
        />
        <Chip
          label={t('What can I do to improve my journey?')}
          size="small"
          variant="outlined"
          onClick={() =>
            onSendMessage('What can I do to improve my journey?')
          }
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
