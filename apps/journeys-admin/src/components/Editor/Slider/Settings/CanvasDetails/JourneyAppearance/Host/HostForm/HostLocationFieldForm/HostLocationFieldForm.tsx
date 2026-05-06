import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { TextFieldForm } from '../../../../../../../../TextFieldForm'

interface HostLocationFieldProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function HostLocationFieldForm({
  value,
  onChange,
  disabled
}: HostLocationFieldProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const handleSubmit = async (value: string): Promise<void> => {
    onChange(value)
  }

  return (
    <TextFieldForm
      id="hostLocation"
      label={t('Location')}
      disabled={disabled}
      initialValue={value}
      onSubmit={handleSubmit}
      data-testid="HostLocationFieldForm"
    />
  )
}
