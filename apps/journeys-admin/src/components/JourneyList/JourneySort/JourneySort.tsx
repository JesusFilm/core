import Sort from '@mui/icons-material/Sort'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { RadioSelect, RadioSelectOption } from '../RadioSelect'

export enum SortOrder {
  CREATED_AT = 'createdAt',
  TITLE = 'title',
  UPDATED_AT = 'updatedAt'
}

interface JourneySortProps {
  sortOrder?: SortOrder
  onChange: (value: SortOrder) => void
  open?: boolean
}

export function JourneySort({
  sortOrder,
  onChange,
  open
}: JourneySortProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const sortOptions: RadioSelectOption<SortOrder>[] = [
    {
      value: SortOrder.CREATED_AT,
      label: t('Date Created')
    },
    {
      value: SortOrder.TITLE,
      label: t('Name')
    },
    {
      value: SortOrder.UPDATED_AT,
      label: t('Last Modified')
    }
  ]

  return (
    <RadioSelect
      value={sortOrder}
      defaultValue={SortOrder.UPDATED_AT}
      options={sortOptions}
      onChange={onChange}
      triggerPrefix={t('Sort By: ')}
      ariaLabel={t('Sort By')}
      open={open}
      mobileIcon={<Sort sx={{ fontSize: '1.25rem' }} />}
    />
  )
}
