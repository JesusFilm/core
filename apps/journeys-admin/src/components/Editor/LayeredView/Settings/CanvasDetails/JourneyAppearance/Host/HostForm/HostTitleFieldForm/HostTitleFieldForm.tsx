import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { TextFieldForm } from '../../../../../../../../TextFieldForm'

interface HostTitleFieldFormProps {
  value: string
  onChange: (value: string) => void
  label?: string
  disabled?: boolean
  hostTitleRequiredErrorMessage?: string
}

export function HostTitleFieldForm({
  value,
  onChange,
  label,
  disabled,
  hostTitleRequiredErrorMessage
}: HostTitleFieldFormProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const titleSchema = object({
    hostTitle: string().required(
      hostTitleRequiredErrorMessage ?? t('Please enter a host name')
    )
  })

  const handleSubmit = async (value: string): Promise<void> => {
    onChange(value)
  }

  return (
    <TextFieldForm
      id="hostTitle"
      label={label ?? t('Host Name')}
      initialValue={value}
      validationSchema={titleSchema}
      onSubmit={handleSubmit}
      disabled={disabled}
      data-testid="HostTitleFieldForm"
    />
  )
}
