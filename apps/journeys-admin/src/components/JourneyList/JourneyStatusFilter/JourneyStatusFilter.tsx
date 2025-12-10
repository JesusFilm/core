import Tune from '@mui/icons-material/Tune'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useBreakpoints } from '@core/shared/ui/useBreakpoints'

import type { JourneyStatus } from '../JourneyListView/JourneyListView'
import { RadioSelect, RadioSelectOption } from '../RadioSelect'

interface JourneyStatusFilterProps {
  status?: JourneyStatus
  onChange: (value: JourneyStatus) => void
  open?: boolean
}

export function JourneyStatusFilter({
  status,
  onChange,
  open
}: JourneyStatusFilterProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const breakpoints = useBreakpoints()

  const statusOptions: RadioSelectOption<JourneyStatus>[] = [
    {
      value: 'active',
      label: t('Active')
    },
    {
      value: 'archived',
      label: t('Archived')
    },
    {
      value: 'trashed',
      label: t('Trash')
    }
  ]

  return (
    <RadioSelect
      value={status}
      defaultValue="active"
      options={statusOptions}
      onChange={onChange}
      ariaLabel={t('Filter by status')}
      open={open}
      sx={{ marginRight: breakpoints.sm ? 3 : 1 }}
      mobileIcon={<Tune sx={{ fontSize: '1.25rem' }} />}
    />
  )
}
