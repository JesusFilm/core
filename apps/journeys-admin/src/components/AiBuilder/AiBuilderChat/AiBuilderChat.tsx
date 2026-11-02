import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { KeyboardEvent, ReactElement, useEffect, useRef, useState } from 'react'

import type { ChatEntry } from '../libs/aiBuilderDraft'

export interface QueuedMessage {
  id: string
  content: string
}

interface AiBuilderChatProps {
  messages: ChatEntry[]
  queued: QueuedMessage[]
  running: boolean
  status: string | null
  onSend: (content: string) => void
  onStop: () => void
  onRemoveQueued: (id: string) => void
}

export function AiBuilderChat({
  messages,
  queued,
  running,
  status,
  onSend,
  onStop,
  onRemoveQueued
}: AiBuilderChatProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [value, setValue] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end' })
  }, [messages.length, queued.length, status])

  function handleSend(): void {
    const content = value.trim()
    if (content === '') return
    onSend(content)
    setValue('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key !== 'Enter' || event.shiftKey) return
    event.preventDefault()
    handleSend()
  }

  return (
    <Stack sx={{ height: '100%', minHeight: 0 }}>
      <Stack
        spacing={2}
        sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}
        data-testid="AiBuilderChatMessages"
      >
        {messages.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            {t(
              'Describe the journey you want, for example "A 5-step Easter journey for teens". Then ask for changes.'
            )}
          </Typography>
        )}
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        {queued.map((message) => (
          <Stack
            key={message.id}
            direction="row"
            spacing={1}
            sx={{ alignSelf: 'flex-end', alignItems: 'center' }}
          >
            <Chip size="small" label={t('Waiting')} />
            <Chip
              label={message.content}
              onDelete={() => onRemoveQueued(message.id)}
              aria-label={t('Remove waiting message')}
            />
          </Stack>
        ))}
        {running && (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              {status ?? t('Working')}
            </Typography>
          </Stack>
        )}
        <Box ref={endRef} />
      </Stack>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          alignItems: 'flex-end'
        }}
      >
        <TextField
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('Message the journey builder')}
          multiline
          maxRows={6}
          fullWidth
          size="small"
          slotProps={{ htmlInput: { 'aria-label': t('Message') } }}
        />
        {running && (
          <Button variant="outlined" color="secondary" onClick={onStop}>
            {t('Stop')}
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={value.trim() === ''}
        >
          {t('Send')}
        </Button>
      </Stack>
    </Stack>
  )
}

function ChatBubble({ message }: { message: ChatEntry }): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const isUser = message.role === 'user'
  return (
    <Box
      sx={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        px: 2,
        py: 1.5,
        borderRadius: 2,
        bgcolor: isUser ? 'primary.main' : 'background.paper',
        color: isUser
          ? 'primary.contrastText'
          : message.kind === 'error'
            ? 'error.main'
            : 'text.primary',
        border: isUser ? 0 : 1,
        borderColor: message.kind === 'plan' ? 'primary.main' : 'divider'
      }}
      data-testid={`AiBuilderChatMessage-${message.role}`}
    >
      {message.kind === 'plan' && (
        <Typography variant="overline" color="primary">
          {t('Plan')}
        </Typography>
      )}
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
        {message.content}
      </Typography>
    </Box>
  )
}
