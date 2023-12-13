import { useMutation } from '@apollo/client'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { FormBlockUpdateCredentials } from '../../../../../../../../../__generated__/FormBlockUpdateCredentials'
import { GetFormBlock_block_FormBlock_forms as FormiumForm } from '../../../../../../../../../__generated__/GetFormBlock'
import { FORM_BLOCK_UPDATE } from '../ApiTokenTextField/ApiTokenTextField'

interface FormSlugSelectProps {
  id?: string
  currentFormSlug?: string | null
  forms?: FormiumForm[]
  loading: boolean
}

export function FormSlugSelect({
  id,
  currentFormSlug,
  forms,
  loading
}: FormSlugSelectProps): ReactElement {
  const [formBlockUpdateCredentials] =
    useMutation<FormBlockUpdateCredentials>(FORM_BLOCK_UPDATE)
  const { t } = useTranslation('apps-journeys-admin')

  async function handleChange(event: SelectChangeEvent): Promise<void> {
    if (id == null || event?.target.value === currentFormSlug) return
    await formBlockUpdateCredentials({
      variables: {
        id,
        input: {
          formSlug: event?.target.value === 'none' ? null : event?.target.value
        }
      }
    })
  }

  return (
    <FormControl variant="filled" disabled={loading}>
      <InputLabel sx={{ '&.MuiFormLabel-root': { lineHeight: 1.5 } }}>
        {t('Form Slug')}
      </InputLabel>

      <Select
        onChange={handleChange}
        value={loading ? '' : currentFormSlug ?? 'none'}
        IconComponent={ChevronDownIcon}
      >
        <MenuItem key="form-formSlug-none" value="none">
          {t('None')}
        </MenuItem>
        {forms?.map((form) => (
          <MenuItem key={`form-formSlug-${form.slug}`} value={form.slug}>
            {form.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
