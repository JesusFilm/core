import Divider from '@mui/material/Divider'
import FormGroup from '@mui/material/FormGroup'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { Dispatch, ReactElement, SetStateAction, useEffect } from 'react'

import { CheckboxOption } from '../CheckBoxOption'

interface ContactDataFormProps {
  setSelectedFields: Dispatch<SetStateAction<string[]>>
  selectedFields: string[]
}

/**
 * Form component that allows users to select which contact data fields to export.
 * Contains switches for name, email, and phone fields.
 *
 * @param setContactData - Callback function to update the selected contact data array in the parent component
 * @returns A form with switches for selecting contact data fields
 */
export function ContactDataForm({
  setSelectedFields,
  selectedFields
}: ContactDataFormProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const handleSelectAll = (checked: boolean): void => {
    setSelectedFields(
      checked
        ? [
            'name',
            'email',
            'phone',
            'RadioQuestionSubmissionEvent',
            'MultiselectSubmissionEvent',
            'SignUpSubmissionEvent',
            'TextResponseSubmissionEvent'
          ]
        : []
    )
  }

  const toggleField = (field: string) => {
    return (checked: boolean) =>
      setSelectedFields((prev) =>
        !checked ? prev.filter((f) => f !== field) : [...prev, field]
      )
  }

  useEffect(() => {
    setSelectedFields([
      'name',
      'email',
      'phone',
      'RadioQuestionSubmissionEvent',
      'MultiselectSubmissionEvent',
      'SignUpSubmissionEvent',
      'TextResponseSubmissionEvent'
    ])
  }, [setSelectedFields])

  return (
    <Stack>
      <FormGroup>
        <CheckboxOption
          checked={selectedFields.length === 7}
          onChange={handleSelectAll}
          label={t('All')}
        />
        <Divider sx={{ my: 1 }} />
        <CheckboxOption
          checked={selectedFields.includes('name')}
          onChange={toggleField('name')}
          label={t('Name')}
        />
        <CheckboxOption
          checked={selectedFields.includes('email')}
          onChange={toggleField('email')}
          label={t('Email')}
        />
        <CheckboxOption
          checked={selectedFields.includes('phone')}
          onChange={toggleField('phone')}
          label={t('Phone')}
        />
        <CheckboxOption
          checked={selectedFields.includes('RadioQuestionSubmissionEvent')}
          onChange={toggleField('RadioQuestionSubmissionEvent')}
          label={t('Poll Selection')}
        />
        <CheckboxOption
          checked={selectedFields.includes('MultiselectSubmissionEvent')}
          onChange={toggleField('MultiselectSubmissionEvent')}
          label={t('Multiselect Submission')}
        />
        <CheckboxOption
          checked={selectedFields.includes('SignUpSubmissionEvent')}
          onChange={toggleField('SignUpSubmissionEvent')}
          label={t('Subscription')}
        />
        <CheckboxOption
          checked={selectedFields.includes('TextResponseSubmissionEvent')}
          onChange={toggleField('TextResponseSubmissionEvent')}
          label={t('Text Submission')}
        />
      </FormGroup>
    </Stack>
  )
}
