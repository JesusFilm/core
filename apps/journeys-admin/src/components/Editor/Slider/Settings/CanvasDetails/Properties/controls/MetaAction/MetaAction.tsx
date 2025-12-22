import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import ActivityIcon from '@core/shared/ui/icons/Activity'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { getCurrentAction } from './utils/getCurrentAction'
import { getFilteredActions } from './utils/getFilteredActions'
import { getNewAction } from './utils/getNewAction'
import type { MetaAction } from './utils/metaActions'

interface MetaActionProps {
  videoActionType?: 'start' | 'complete'
  label?: string
  showHelperText?: boolean
}

export function MetaAction({
  videoActionType,
  label,
  showHelperText = true
}: MetaActionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedBlock }
  } = useEditor()
  const [metaAction, setMetaAction] = useState<MetaAction>(
    getCurrentAction(selectedBlock, videoActionType)
  )

  function handleChange(event: SelectChangeEvent): void {
    setMetaAction(getNewAction(event.target.value))
  }

  const filteredActions: MetaAction[] = getFilteredActions(
    selectedBlock,
    videoActionType
  )

  const displayLabel = label ?? t('Event to track:')

  return (
    <>
      <Stack sx={{ px: 4, pt: 0, pb: 3 }} data-testid="MetaActionSelect">
        <FormControl variant="filled">
          <InputLabel sx={{ '&.MuiFormLabel-root': { lineHeight: 1.5 } }}>
            {displayLabel}
          </InputLabel>

          <Select
            onChange={handleChange}
            value={metaAction.type}
            IconComponent={ChevronDownIcon}
          >
            {filteredActions.map(({ type, label }) => {
              return (
                <MenuItem key={`button-action-${label}`} value={type}>
                  {t(label)}
                </MenuItem>
              )
            })}
          </Select>
          {showHelperText && (
            <FormHelperText sx={{ mb: 2, mt: 3 }}>
              {t(
                'Pick the event label you want to appear in analytics. Tracking covers user actions in every project created from your template.'
              )}
            </FormHelperText>
          )}
        </FormControl>
      </Stack>
    </>
  )
}
