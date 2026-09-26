import Chip, { ChipProps } from '@mui/material/Chip'
import { ReactElement } from 'react'

import {
  HEALTH_LABELS,
  STATUS_OPTIONS,
  ShortLinkHealth,
  ShortLinkStatus,
  labelFor
} from '../../libs/shortLink'

const STATUS_COLORS: Record<ShortLinkStatus, ChipProps['color']> = {
  active: 'success',
  paused: 'warning',
  retired: 'default'
}

interface StatusChipProps {
  status: ShortLinkStatus
}

export function StatusChip({ status }: StatusChipProps): ReactElement {
  return (
    <Chip
      size="small"
      label={labelFor(STATUS_OPTIONS, status)}
      color={STATUS_COLORS[status] ?? 'default'}
      variant={status === 'retired' ? 'outlined' : 'filled'}
    />
  )
}

interface HealthChipProps {
  health: ShortLinkHealth | null | undefined
}

export function HealthChip({ health }: HealthChipProps): ReactElement {
  if (health == null) {
    return <Chip size="small" label="Not checked" variant="outlined" />
  }

  return (
    <Chip
      size="small"
      label={HEALTH_LABELS[health] ?? health}
      color={health === 'ok' ? 'success' : 'error'}
      variant={health === 'ok' ? 'outlined' : 'filled'}
    />
  )
}
