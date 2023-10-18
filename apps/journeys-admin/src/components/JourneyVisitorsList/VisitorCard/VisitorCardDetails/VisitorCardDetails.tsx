import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { format, parseISO } from 'date-fns'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { GetJourneyVisitors_visitors_edges_node_events as Event } from '../../../../../__generated__/GetJourneyVisitors'

interface VisitorCardDetailsProps {
  name?: string | null
  events: Event[]
  loading: boolean
}

export function VisitorCardDetails({
  name,
  events,
  loading
}: VisitorCardDetailsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const eventsFilter: Array<Event['__typename']> = [
    'ChatOpenEvent',
    'TextResponseSubmissionEvent',
    'RadioQuestionSubmissionEvent'
  ]

  const filteredEvents = events.filter((event) =>
    eventsFilter.includes(event.__typename)
  )

  return (
    <Box
      sx={{
        pl: { xs: '9px', sm: 9 },
        pt: filteredEvents.length > 0 || loading ? 3 : 0
      }}
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
          {name != null && (
            <DetailsRow label={t('Name')} value={name} loading={loading} />
          )}

          {filteredEvents.map((event) => {
            if (event.__typename === 'ChatOpenEvent') {
              return (
                <DetailsRow
                  key={event.id}
                  label={t('Chat Started')}
                  value={format(parseISO(event.createdAt), 'h:mmaaa')}
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
