import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { AiBuilderChat, type QueuedMessage } from './AiBuilderChat'
import { AiBuilderDraftList } from './AiBuilderDraftList'
import { AiBuilderPreview } from './AiBuilderPreview'
import { type AiBuilderDraft, addUserMessage } from './libs/aiBuilderDraft'
import { useAiBuilderDrafts } from './libs/useAiBuilderDrafts'
import { useAiBuilderRun } from './libs/useAiBuilderRun'

/**
 * AI journey builder, chunk 1 (ENG-3768): drafts, chat and a live preview,
 * with drafts in localStorage. Messages run one at a time; a message sent
 * during a run waits in the browser and runs afterwards, on the new journey.
 * Stop ends the current run, and the next waiting message then starts.
 */
export function AiBuilder(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    drafts,
    activeDraft,
    selectDraft,
    newDraft,
    deleteDraft,
    updateDraft
  } = useAiBuilderDrafts()
  const { running, status, start, stop } = useAiBuilderRun(updateDraft)
  const [queued, setQueued] = useState<QueuedMessage[]>([])

  const sendNow = useCallback(
    (draft: AiBuilderDraft, content: string) => {
      const next = addUserMessage(draft, content)
      updateDraft(draft.id, () => next)
      start(next)
    },
    [start, updateDraft]
  )

  useEffect(() => {
    if (running || queued.length === 0 || activeDraft == null) return
    const [next, ...rest] = queued
    setQueued(rest)
    sendNow(activeDraft, next.content)
  }, [running, queued, activeDraft, sendNow])

  function handleSend(content: string): void {
    if (running) {
      setQueued((current) => [...current, { id: uuidv4(), content }])
      return
    }
    sendNow(activeDraft ?? newDraft(), content)
  }

  function handleSelect(id: string): void {
    setQueued([])
    selectDraft(id)
  }

  function handleRemoveQueued(id: string): void {
    setQueued((current) => current.filter((message) => message.id !== id))
  }

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      sx={{ height: 'calc(100vh - 48px)', minHeight: 0 }}
    >
      <Box
        sx={{
          width: { md: 240 },
          borderRight: { md: 1 },
          borderColor: 'divider',
          flexShrink: 0
        }}
      >
        <AiBuilderDraftList
          drafts={drafts}
          activeId={activeDraft?.id ?? null}
          disabled={running}
          onSelect={handleSelect}
          onNew={newDraft}
          onDelete={deleteDraft}
        />
      </Box>
      <Box sx={{ flexGrow: 1, minWidth: 0, minHeight: 0 }}>
        <AiBuilderChat
          messages={activeDraft?.messages ?? []}
          queued={queued}
          running={running}
          status={status}
          onSend={handleSend}
          onStop={stop}
          onRemoveQueued={handleRemoveQueued}
        />
      </Box>
      <Box
        sx={{
          width: { md: 420 },
          borderLeft: { md: 1 },
          borderColor: 'divider',
          overflowY: 'auto',
          flexShrink: 0
        }}
      >
        {activeDraft != null && activeDraft.warnings.length > 0 && (
          <Alert severity="warning" sx={{ m: 2 }}>
            {t('Some things need a look:')}
            {activeDraft.warnings.map((warning) => (
              <Box key={warning}>{warning}</Box>
            ))}
          </Alert>
        )}
        <AiBuilderPreview blocks={activeDraft?.blocks ?? []} />
      </Box>
    </Stack>
  )
}
