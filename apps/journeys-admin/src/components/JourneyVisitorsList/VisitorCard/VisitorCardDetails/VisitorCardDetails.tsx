import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { format, parseISO } from 'date-fns'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import {
  GetJourneyVisitors_visitors_edges_node_events as Event,
  GetJourneyVisitors_visitors_edges_node_events_TextResponseSubmissionEvent as TextEvent
} from '../../../../../__generated__/GetJourneyVisitors'

interface VisitorCardDetailsProps {
  events: Event[]
  loading: boolean
}

export function VisitorCardDetails({
  events,
  loading
}: VisitorCardDetailsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const eventsFilter: Array<Event['__typename']> = [
    'ChatOpenEvent',
    'RadioQuestionSubmissionEvent'
  ]

  const textResponseEventFilter: Array<Event['__typename']> = [
    'TextResponseSubmissionEvent'
  ]

  const filteredEvents = events.filter((event) => {
    return eventsFilter.includes(event.__typename)
  })

  const textResponseEvents: TextEvent[] = events.filter((event) =>
    textResponseEventFilter.includes(event.__typename)
  ) as TextEvent[]

  const eventsToRender = [
    ...filteredEvents,
    ...filterRecentTextResponseEvents(textResponseEvents)
  ]

  return (
    <Box
      sx={{
        pl: { xs: '9px', sm: 9 },
        pt: filteredEvents.length > 0 || loading ? 3 : 0
      }}
      data-testid="VisitorCardDetails"
    >
      {loading ? (
        <>
          {[0, 1].map((i) => (
            <DetailsRow
              key={i}
              label={i as unknown as string}
              loading={loading}
            />
          ))}
        </>
      ) : (
        <>
          {eventsToRender.map((event) => {
            if (event.__typename === 'ChatOpenEvent') {
              return (
                <DetailsRow
                  key={event.id}
                  label={t('Chat Started')}
                  value={format(parseISO(event.createdAt as string), 'h:mmaaa')}
                  chatEvent
                  loading={loading}
                />
              )
            } else {
              return (
                <DetailsRow
                  key={event.id}
                  label={event.label}
                  value={event.value}
                  loading={loading}
                />
              )
            }
          })}
        </>
      )}
    </Box>
  )
}

interface DetailsRowProps {
  label: string | null
  value?: string | null
  chatEvent?: boolean
  loading: boolean
}

function DetailsRow({
  label,
  value,
  chatEvent = false,
  loading
}: DetailsRowProps): ReactElement {
  const textColor = chatEvent ? 'primary' : 'secondary'
  const variant = chatEvent ? 'subtitle2' : 'body1'
  return (
    <Stack direction="row">
      <Typography
        variant="h5"
        color={textColor}
        sx={{
          display: { xs: 'flex', sm: 'none' },
          pt: 6,
          pl: { xs: 1, sm: 1 },
          minWidth: '28px'
        }}
      >
        {'\u00B7\u00A0'}
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ pb: 1 }}>
        {loading ? (
          <Skeleton
            width={50}
            height={25}
            data-testid="description-skeleton"
            sx={{
              marginRight: { xs: 'none', sm: '212px' }
            }}
          />
        ) : (
          <Typography
            noWrap
            color={textColor}
            variant={variant}
            sx={{
              minWidth: '262px',
              maxWidth: '262px',
              paddingRight: { xs: 0, sm: 5 }
            }}
          >
            {label}
          </Typography>
        )}

        <Typography
          variant="h5"
          color={textColor}
          sx={{
            display: { xs: 'none', sm: 'flex' },
            paddingRight: { xs: 0, sm: 3 }
          }}
        >
          {'\u00B7\u00A0'}
        </Typography>
        {loading ? (
          <Skeleton width={100} height={25} />
        ) : (
          <Typography color={textColor} variant={variant}>
            {value}
          </Typography>
        )}
      </Stack>
    </Stack>
  )
}

function filterRecentTextResponseEvents<T extends TextEvent>(events: T[]): T[] {
  const eventMap = new Map<string, T>()

  events.forEach((event) => {
    if (event.blockId != null) {
      const existingEvent = eventMap.get(event.blockId)
      if (
        existingEvent == null ||
        new Date(event.createdAt as string) >
          new Date(existingEvent.createdAt as string)
      ) {
        eventMap.set(event.blockId, event)
      }
    }
  })

  return Array.from(eventMap.values())
}
