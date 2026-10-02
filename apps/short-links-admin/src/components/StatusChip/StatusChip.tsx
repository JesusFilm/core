import { ComponentProps, ReactElement } from 'react'

import {
  HEALTH_LABELS,
  STATUS_OPTIONS,
  ShortLinkHealth,
  ShortLinkStatus,
  labelFor
} from '../../libs/shortLink'

import { Badge } from '@/components/ui/badge'

type BadgeVariant = ComponentProps<typeof Badge>['variant']

const STATUS_VARIANTS: Record<ShortLinkStatus, BadgeVariant> = {
  active: 'success',
  paused: 'warning',
  retired: 'outline'
}

interface StatusChipProps {
  status: ShortLinkStatus
}

export function StatusChip({ status }: StatusChipProps): ReactElement {
  return (
    <Badge variant={STATUS_VARIANTS[status] ?? 'secondary'}>
      {labelFor(STATUS_OPTIONS, status)}
    </Badge>
  )
}

interface HealthChipProps {
  health: ShortLinkHealth | null | undefined
}

export function HealthChip({ health }: HealthChipProps): ReactElement {
  if (health == null) return <Badge variant="outline">Not checked</Badge>

  return (
    <Badge variant={health === 'ok' ? 'success' : 'error'}>
      {HEALTH_LABELS[health] ?? health}
    </Badge>
  )
}
