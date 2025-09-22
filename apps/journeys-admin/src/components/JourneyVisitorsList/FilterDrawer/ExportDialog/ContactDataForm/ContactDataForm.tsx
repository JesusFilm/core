import Divider from '@mui/material/Divider'
import FormGroup from '@mui/material/FormGroup'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import { CheckboxOption } from '../CheckBoxOption'

interface ContactDataState {
  name: boolean
  email: boolean
  phone: boolean
}

interface ContactDataFormProps {
  setContactData: (contactData: string[]) => void
}

/**
 * Form component that allows users to select which contact data fields to export.
 * Contains switches for name, email, and phone fields.
 *
 * @param setSelectedEvents - Callback function to update the selected events array in the parent component
 * @returns A form with switches for selecting contact data fields
 */
export function ContactDataForm({
  setContactData
}: ContactDataFormProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [contactDataState, setContactDataState] = useState<ContactDataState>({
    name: true,
    email: true,
    phone: true
  })
  const [selectAll, setSelectAll] = useState(true)

  const handleSelectAll = (checked: boolean): void => {
    setContactDataState({
      name: checked,
      email: checked,
      phone: checked
    })
  }

  useEffect(() => {
    const allSelected =
      contactDataState.name && contactDataState.email && contactDataState.phone
    setSelectAll(allSelected)

    const selectedFields: string[] = []
    if (contactDataState.name) selectedFields.push('name')
    if (contactDataState.email) selectedFields.push('email')
    if (contactDataState.phone) selectedFields.push('phone')

    setContactData(selectedFields)
  }, [contactDataState, setContactData])

  return (
    <Stack>
      <FormGroup>
        <CheckboxOption
          checked={selectAll}
          onChange={handleSelectAll}
          label={t('All')}
        />
        <Divider sx={{ my: 1 }} />
        <CheckboxOption
          checked={contactDataState.name}
          onChange={(checked) =>
            setContactDataState((prev) => ({ ...prev, name: checked }))
          }
          label={t('Name')}
        />
        <CheckboxOption
          checked={contactDataState.email}
          onChange={(checked) =>
            setContactDataState((prev) => ({ ...prev, email: checked }))
          }
          label={t('Email')}
        />
        <CheckboxOption
          checked={contactDataState.phone}
          onChange={(checked) =>
            setContactDataState((prev) => ({ ...prev, phone: checked }))
          }
          label={t('Phone')}
        />
      </FormGroup>
    </Stack>
  )
}
