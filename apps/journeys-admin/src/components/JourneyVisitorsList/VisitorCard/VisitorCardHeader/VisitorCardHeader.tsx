import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import { format, parseISO } from 'date-fns'
import { useTranslation } from 'react-i18next'
import Skeleton from '@mui/material/Skeleton'
import { VisitorStatus } from '../../../../../__generated__/globalTypes'
import { getStatusIcon, transformDuration } from '../utils'

interface Props {
  icon: VisitorStatus | null
  name?: string | null
  location: string | null
  source: string | null
  createdAt: string
  duration: number | null
  loading: boolean
}

export function VisitorCardHeader({
  icon,
  name,
  location,
  source,
  createdAt,
  duration,
  loading = true
}: Props): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const status = getStatusIcon(icon)
  const journeyDuration = transformDuration(duration, t)
  return (
    <>
      {/* Desktop */}
      <Stack direction="row" sx={{ display: { xs: 'none', sm: 'flex' } }}>
        {loading ? (
          <Skeleton width={200} />
        ) : (
          <Typography variant="subtitle1">{name}</Typography>
        )}
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
          {createdAt != null && !loading ? (
            <Typography
              variant="subtitle1"
              noWrap
              sx={{ color: 'secondary.light' }}
            >
              {format(parseISO(createdAt), 'h:mmaaa, LLL. do')}
            </Typography>
          ) : (
            <Skeleton width={250} data-testid="header-skeleton" />
          )}
          <Typography variant="subtitle1" sx={{ color: 'secondary.light' }}>
            {'\u00A0\u00B7\u00A0'}
          </Typography>
          {loading ? (
            <Skeleton width={50} />
          ) : (
            <Typography
              variant="subtitle1"
              sx={{ color: 'secondary.light' }}
              noWrap
            >
              {journeyDuration}
            </Typography>
          )}
        </Stack>
      </Stack>

      {/* Mobile */}
      <Stack direction="row" sx={{ display: { xs: 'flex', sm: 'none' } }}>
        {loading ? (
          <Skeleton
            variant="circular"
            width={25}
            height={25}
            sx={{ mr: 3, mt: 6, display: { xs: 'block', sm: 'none' } }}
          />
        ) : status != null ? (
          <Typography sx={{ mr: 3, mt: 6 }}>{status}</Typography>
        ) : (
          <PersonOutlineRoundedIcon sx={{ mr: 3, mt: 6 }} />
        )}
        <Stack direction="column">
          <Stack direction="row">
            {createdAt != null && !loading ? (
              <Typography variant="subtitle1" sx={{ color: 'secondary.light' }}>
                {format(parseISO(createdAt), 'h:mmaaa, LLL. do')}
              </Typography>
            ) : (
              <Skeleton width={100} />
            )}
            <Typography variant="subtitle1" sx={{ color: 'secondary.light' }}>
              {'\u00A0\u00B7\u00A0'}
            </Typography>
            {loading ? (
              <Skeleton width={50} />
            ) : (
              <Typography
                variant="subtitle1"
                sx={{ color: 'secondary.light' }}
                noWrap
              >
                {journeyDuration}
              </Typography>
            )}
          </Stack>
          <Stack direction="row">
            {loading ? (
              <Skeleton width={200} height={25} />
            ) : (
              <Typography variant="subtitle1">{name}</Typography>
            )}
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
