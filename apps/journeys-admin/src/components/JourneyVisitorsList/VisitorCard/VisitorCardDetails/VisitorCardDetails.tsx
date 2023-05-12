import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { Event } from '../../fakeData'

interface Props {
  name?: string
  events: Event[]
}

export function VisitorCardDetails({ name, events }: Props): ReactElement {
  return (
    <>
      {events.length > 0 && (
        <Box sx={{ pt: 3 }}>
          <DetailsRow label="Name" value={name} />
        </Box>
      )}
      {events.map((event) => (
        <DetailsRow
          key={event.id}
          label={event.label}
          value={event.value}
          chatEvent={event.__typename === 'Chat'}
        />
      ))}
    </>
  )
}

interface DetailsRowProps {
  label?: string
  value?: string
  chatEvent?: boolean
}

function DetailsRow({
  label,
  value,
  chatEvent = false
}: DetailsRowProps): ReactElement {
  const textColor = chatEvent ? 'primary' : 'secondary'
  return (
    <>
      {label != null && value != null && (
        <Stack direction="row">
          <Typography
            variant="subtitle1"
            color={textColor}
            sx={{
              display: { xs: 'flex', sm: 'none' },
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
              sx={{ minWidth: '262px', maxWidth: '262px' }}
            >
              {label}
            </Typography>
            <Typography
              variant="subtitle1"
              color={textColor}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              {'\u00B7\u00A0'}
            </Typography>
            <Typography color={textColor}>{value}</Typography>
          </Stack>
        </Stack>
      )}
    </>
  )
}
