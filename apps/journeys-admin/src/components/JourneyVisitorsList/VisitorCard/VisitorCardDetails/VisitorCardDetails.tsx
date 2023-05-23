import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'react-i18next'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { format, parseISO } from 'date-fns'
import Skeleton from '@mui/material/Skeleton'
import { GetJourneyVisitors_visitors_edges_node_events as Event } from '../../../../../__generated__/GetJourneyVisitors'

interface Props {
  name?: string
  events: Event[]
  loading: boolean
}

export function VisitorCardDetails({
  name,
  events,
  loading
}: Props): ReactElement {
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
    <>
      <Box sx={{ pt: 3 }}>
        <DetailsRow label={t('Name')} value={name} loading={loading} />
      </Box>

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
        variant="subtitle1"
        color={textColor}
        sx={{
          display: { xs: 'flex', sm: 'none' },
          paddingLeft: { xs: '10px', sm: 'none' },
          pt: 6,
          pl: 1,
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
              paddingRight: { xs: 'none', sm: '35px' }
            }}
          >
            {label}
          </Typography>
        )}

        <Typography
          variant="subtitle1"
          color={textColor}
          sx={{
            display: { xs: 'none', sm: 'flex' },
            paddingRight: { xs: 'none', sm: '10px' }
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
