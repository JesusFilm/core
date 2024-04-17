import { useMutation } from '@apollo/client'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { FormBlockUpdateCredentials } from '../../../../../../../../../__generated__/FormBlockUpdateCredentials'
import { GetFormBlock_block_FormBlock_projects as FormiumProject } from '../../../../../../../../../__generated__/GetFormBlock'
import { FORM_BLOCK_UPDATE } from '../ApiTokenTextField/ApiTokenTextField'

interface ProjectIdSelectProps {
  id?: string
  currentProjectId?: string | null
  projects?: FormiumProject[]
  loading: boolean
}

export function ProjectIdSelect({
  id,
  currentProjectId,
  projects,
  loading
}: ProjectIdSelectProps): ReactElement {
  const [formBlockUpdateCredentials] =
    useMutation<FormBlockUpdateCredentials>(FORM_BLOCK_UPDATE)
  const { t } = useTranslation('apps-journeys-admin')

  async function handleChange(event: SelectChangeEvent): Promise<void> {
    if (id == null || event?.target.value === currentProjectId) return
    await formBlockUpdateCredentials({
      variables: {
        id,
        input: {
          projectId: event?.target.value === 'none' ? null : event?.target.value
        }
      }
    })
  }

  return (
    <FormControl variant="filled" disabled={loading}>
      <InputLabel sx={{ '&.MuiFormLabel-root': { lineHeight: 1.5 } }}>
        {t('Project Id')}
      </InputLabel>

      <Select
        onChange={handleChange}
        value={loading ? '' : currentProjectId ?? 'none'}
        IconComponent={ChevronDownIcon}
      >
        <MenuItem key="form-projectId-none" value="none">
          {t('None')}
        </MenuItem>
        {projects?.map((project) => (
          <MenuItem key={project.id} value={project.id}>
            {project.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
