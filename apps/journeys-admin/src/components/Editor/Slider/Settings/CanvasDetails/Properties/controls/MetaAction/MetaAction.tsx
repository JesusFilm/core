import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import ActivityIcon from '@core/shared/ui/icons/Activity'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

// TODO: get real types for backend
type MetaActionType =
  | 'none'
  | 'prayerRequestCapture'
  | 'christDecisionCapture'
  | 'gospelStartCapture'
  | 'gospelCompleteCapture'
  | 'rsvpCapture'
  | 'specialVideoStartCapture'
  | 'specialVideoCompleteCapture'
  | 'custom1Capture'
  | 'custom2Capture'
  | 'custom3Capture'

interface MetaAction {
  type: MetaActionType
  label: string
}

const metaActions: MetaAction[] = [
  { type: 'none', label: 'None' },
  { type: 'prayerRequestCapture', label: 'Prayer Request' },
  { type: 'christDecisionCapture', label: 'Decision for Christ' },
  {
    type: 'gospelStartCapture',
    label: 'Gospel Presentation Started'
  },
  {
    type: 'gospelCompleteCapture',
    label: 'Gospel Presentation Completed'
  },
  { type: 'rsvpCapture', label: 'RSVP' },
  { type: 'specialVideoStartCapture', label: 'Video Started' },
  {
    type: 'specialVideoCompleteCapture',
    label: 'Video Completed'
  },
  { type: 'custom1Capture', label: 'Custom Event 1' },
  { type: 'custom2Capture', label: 'Custom Event 2' },
  { type: 'custom3Capture', label: 'Custom Event 3' }
]

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
      <Stack sx={{ px: 4, pt: 0, pb: 3 }} data-testid="Action">
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

function getFilteredActions(
  selectedBlock?: TreeBlock,
  videoActionType?: 'start' | 'complete'
): MetaAction[] {
  if (selectedBlock == null) {
    return metaActions
  }

  const allowedActionTypes: MetaActionType[] = []

  switch (selectedBlock.__typename) {
    case 'CardBlock':
      allowedActionTypes.push(
        'none',
        'christDecisionCapture',
        'gospelStartCapture',
        'gospelCompleteCapture',
        'custom1Capture',
        'custom2Capture',
        'custom3Capture'
      )
      break

    case 'ButtonBlock': {
      const isSubmitButton =
        'submitEnabled' in selectedBlock && selectedBlock.submitEnabled === true

      if (isSubmitButton) {
        allowedActionTypes.push(
          'none',
          'rsvpCapture',
          'prayerRequestCapture',
          'christDecisionCapture',
          'custom1Capture',
          'custom2Capture',
          'custom3Capture'
        )
      } else {
        allowedActionTypes.push(
          'none',
          'christDecisionCapture',
          'prayerRequestCapture',
          'gospelStartCapture',
          'gospelCompleteCapture',
          'custom1Capture',
          'custom2Capture',
          'custom3Capture'
        )
      }
      break
    }

    case 'RadioOptionBlock':
      allowedActionTypes.push(
        'none',
        'christDecisionCapture',
        'prayerRequestCapture',
        'gospelStartCapture',
        'gospelCompleteCapture',
        'custom1Capture',
        'custom2Capture',
        'custom3Capture'
      )
      break

    case 'VideoBlock': {
      if (videoActionType == null) {
        return metaActions
      }
      if (videoActionType === 'start') {
        allowedActionTypes.push(
          'none',
          'specialVideoStartCapture',
          'gospelStartCapture',
          'christDecisionCapture',
          'prayerRequestCapture',
          'custom1Capture',
          'custom2Capture',
          'custom3Capture'
        )
      } else if (videoActionType === 'complete') {
        allowedActionTypes.push(
          'none',
          'specialVideoCompleteCapture',
          'gospelCompleteCapture',
          'christDecisionCapture',
          'prayerRequestCapture',
          'custom1Capture',
          'custom2Capture',
          'custom3Capture'
        )
      }
      break
    }

    default:
      return metaActions
  }

  return metaActions.filter((action) =>
    allowedActionTypes.includes(action.type)
  )
}

function getCurrentAction(
  selectedBlock?: TreeBlock,
  videoActionType?: 'start' | 'complete'
): MetaAction {
  // return (selectedBlock?.metaAction?.__typename as MetaActionType) ?? 'none'
  // TODO: fix logic for finding action of the block
  // once block types are added
  return metaActions[0]
}

function getNewAction(value: string): MetaAction {
  return metaActions.find((action) => action.type === value) ?? metaActions[0]
}
