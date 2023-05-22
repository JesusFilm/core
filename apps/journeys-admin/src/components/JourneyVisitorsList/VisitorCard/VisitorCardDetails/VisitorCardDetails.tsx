import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'react-i18next'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { format, parseISO } from 'date-fns'
import { GetJourneyVisitors_visitors_edges_node_events as Event } from '../../../../../__generated__/GetJourneyVisitors'

interface Props {
  name?: string
  events: Event[]
}

export function VisitorCardDetails({ name, events }: Props): ReactElement {
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
      {filteredEvents.length > 0 && (
        <Box sx={{ pt: 3 }}>
          <DetailsRow label={t('Name')} value={name} />
        </Box>
      )}
      {filteredEvents.map((event) => {
        if (event.__typename === 'ChatOpenEvent') {
          return (
            <DetailsRow
              key={event.id}
              label={t('Chat Started')}
              value={format(parseISO(event.createdAt), 'h:mmaaa')}
              chatEvent
            />
          )
        } else {
          return (
            <DetailsRow
              key={event.id}
              label={event.label}
              value={event.value}
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
}

function DetailsRow({
  label,
  value,
  chatEvent = false
}: DetailsRowProps): ReactElement {
  const textColor = chatEvent ? 'primary' : 'secondary'
  const isBold = chatEvent ? 900 : 'normal'
  return (
    <>
      {label != null && value != null && (
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
            <Typography
              noWrap
              color={textColor}
              sx={{
                minWidth: '262px',
                maxWidth: '262px',
                fontWeight: isBold,
                paddingRight: { xs: 'none', sm: '35px' }
              }}
            >
              {label}
            </Typography>

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
            <Typography color={textColor} sx={{ fontWeight: isBold }}>
              {value}
            </Typography>
          </Stack>
        </Stack>
      )}
    </>
  )
}
