import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import { format, parseISO } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { VisitorStatus } from '../../../../../__generated__/globalTypes'
import { getStatusIcon, transformDuration } from '../utils'

interface Props {
  icon: VisitorStatus | null
  name?: string
  location: string | null
  source: string | null
  createdAt: string
  duration: number | null
}

export function VisitorCardHeader({
  icon,
  name,
  location,
  source,
  createdAt,
  duration
}: Props): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const status = getStatusIcon(icon)
  const journeyDuration = transformDuration(duration, t)
  return (
    <>
      {/* Desktop */}
      <Stack direction="row" sx={{ display: { xs: 'none', sm: 'flex' } }}>
        <Typography variant="subtitle1">{name}</Typography>
        {name != null && location != null && (
          <Typography variant="subtitle1">{'\u00A0\u00B7\u00A0'}</Typography>
        )}
        <Typography variant="subtitle1" noWrap>
          {location}
        </Typography>

        {((name != null && source != null) ||
          (location != null && source != null)) && (
          <Typography variant="subtitle1">{'\u00A0\u00B7\u00A0'}</Typography>
        )}
        <Typography variant="subtitle1" noWrap>
          {source}
        </Typography>
        <Stack direction="row" sx={{ ml: 'auto' }}>
          <Typography
            variant="subtitle1"
            sx={{ color: 'secondary.light' }}
            noWrap
          >
            {format(parseISO(createdAt), 'h:mmaaa, LLL. do')}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'secondary.light' }}>
            {'\u00A0\u00B7\u00A0'}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ color: 'secondary.light' }}
            noWrap
          >
            {journeyDuration}
          </Typography>
        </Stack>
      </Stack>

      {/* Mobile */}
      <Stack direction="row" sx={{ display: { xs: 'flex', sm: 'none' } }}>
        {status != null ? (
          <Typography sx={{ mr: 3, mt: 6 }}>{status}</Typography>
        ) : (
          <PersonOutlineRoundedIcon sx={{ mr: 3, mt: 6 }} />
        )}
        <Stack direction="column">
          <Stack direction="row">
            <Typography variant="subtitle1" sx={{ color: 'secondary.light' }}>
              {format(parseISO(createdAt), 'h:mmaaa, LLL. do')}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'secondary.light' }}>
              {'\u00A0\u00B7\u00A0'}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'secondary.light' }}>
              {journeyDuration}
            </Typography>
          </Stack>
          <Stack direction="row">
            <Typography variant="subtitle1">{name}</Typography>
            {name != null && source != null && (
              <Typography variant="subtitle1">
                {'\u00A0\u00B7\u00A0'}
              </Typography>
            )}
            <Typography variant="subtitle1">{source}</Typography>
          </Stack>
          <Typography variant="subtitle1">{location}</Typography>
        </Stack>
      </Stack>
    </>
  )
}
