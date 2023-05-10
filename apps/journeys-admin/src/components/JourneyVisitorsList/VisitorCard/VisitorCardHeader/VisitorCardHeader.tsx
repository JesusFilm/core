import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import { format, parseISO } from 'date-fns'

interface Props {
  icon?: string
  name?: string
  location?: string
  source?: string
  createdAt: string
  duration: string
}

export function VisitorCardHeader({
  icon,
  name,
  location,
  source,
  createdAt,
  duration
}: Props): ReactElement {
  function getIcon(icon?: string): string | undefined {
    let res
    switch (icon) {
      case 'tick':
        res = '✅'
        break
      case 'warning':
        res = '❗'
        break
    }
    return res
  }

  const status = getIcon(icon)
  return (
    <>
      {/* Desktop */}
      <Stack direction="row" sx={{ display: { xs: 'none', sm: 'flex' } }}>
        {status != null ? (
          <Typography sx={{ mr: 3 }}>{status}</Typography>
        ) : (
          <PersonOutlineRoundedIcon sx={{ mr: 3 }} />
        )}
        <Typography>{name}</Typography>
        {name != null && location != null && (
          <Typography>{'\u00A0\u00B7\u00A0'}</Typography>
        )}
        <Typography>{location}</Typography>

        {((name != null && source != null) ||
          (location != null && source != null)) && (
          <Typography>{'\u00A0\u00B7\u00A0'}</Typography>
        )}
        <Typography>{source}</Typography>
        <Stack direction="row" sx={{ ml: 'auto' }}>
          <Typography>
            {format(parseISO(createdAt), 'hmmaaa, LLL. do')}
          </Typography>
          <Typography>{'\u00A0\u00B7\u00A0'}</Typography>
          <Typography>{duration}</Typography>
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
            <Typography>
              {format(parseISO(createdAt), 'hmmaaa, LLL. do')}
            </Typography>
            <Typography>{'\u00A0\u00B7\u00A0'}</Typography>
            <Typography>{duration}</Typography>
          </Stack>
          <Stack direction="row">
            <Typography>{name}</Typography>
            {name != null && source != null && (
              <Typography>{'\u00A0\u00B7\u00A0'}</Typography>
            )}
            <Typography>{source}</Typography>
          </Stack>
          <Typography>{location}</Typography>
        </Stack>
      </Stack>
    </>
  )
}
