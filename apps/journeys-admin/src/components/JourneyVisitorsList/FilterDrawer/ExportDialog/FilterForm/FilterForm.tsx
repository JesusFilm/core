import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import FormGroup from '@mui/material/FormGroup'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import forIn from 'lodash/forIn'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import ChevronDown from '@core/shared/ui/icons/ChevronDown'
import ChevronUp from '@core/shared/ui/icons/ChevronUp'

import { EventType } from '../../../../../../__generated__/globalTypes'
import { FILTERED_EVENTS } from '../../../../../libs/useJourneyEventsExport/utils/constants'
import { CheckboxOption } from '../CheckBoxOption'

interface CheckboxState {
  JourneyViewEvent: boolean
  ChatOpenEvent: boolean
  TextResponseSubmissionEvent: boolean
  RadioQuestionSubmissionEvent: boolean
  ButtonClickEvent: boolean
  SignUpSubmissionEvent: boolean
  VideoStartEvent: boolean
  VideoPlayEvent: boolean
  VideoPauseEvent: boolean
  VideoCompleteEvent: boolean
  VideoProgressEvent: boolean
}

interface FilterFormProps {
  setSelectedEvents: (events: string[]) => void
}

/**
 * Form component that allows users to select which journey events to export.
 * Contains a list of checkboxes for regular events and collapsible video events.
 * Features:
 * - Select all/none functionality
 * - Grouped video events with expand/collapse
 * - Indeterminate state for video events group
 * - Automatic event type conversion for export
 *
 * @param setSelectedEvents - Callback function to update the selected events array in the parent component
 * @returns A form with checkboxes for selecting different types of journey events
 */
export function FilterForm({
  setSelectedEvents
}: FilterFormProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [checkboxState, setCheckboxState] = useState<CheckboxState>({
    JourneyViewEvent: true,
    ChatOpenEvent: true,
    TextResponseSubmissionEvent: true,
    RadioQuestionSubmissionEvent: true,
    ButtonClickEvent: true,
    SignUpSubmissionEvent: true,
    VideoStartEvent: true,
    VideoPlayEvent: true,
    VideoPauseEvent: true,
    VideoCompleteEvent: true,
    VideoProgressEvent: true
  })
  const [selectAll, setSelectAll] = useState(true)

  const [videoEventsExpanded, setVideoEventsExpanded] = useState(false)

  const [videoEventsSelected, setVideoEventsSelected] = useState<
    'all' | 'some' | 'none'
  >('all')

  const VIDEO_EVENT_KEYS: { key: string; label: string }[] = []
  const REGULAR_EVENT_KEYS: { key: string; label: string }[] = []
  FILTERED_EVENTS.forEach((event) => {
    if (event.includes('Video')) {
      VIDEO_EVENT_KEYS.push({ key: event, label: getLabel(event) })
    } else {
      REGULAR_EVENT_KEYS.push({ key: event, label: getLabel(event) })
    }
  })
  function getLabel(key: string): string {
    switch (key) {
      case 'JourneyViewEvent':
        return t('Journey Start')
      case 'ChatOpenEvent':
        return t('Chat Open')
      case 'TextResponseSubmissionEvent':
        return t('Text Submission')
      case 'RadioQuestionSubmissionEvent':
        return t('Poll Selection')
      case 'ButtonClickEvent':
        return t('Button Click')
      case 'SignUpSubmissionEvent':
        return t('Subscription')
      case 'VideoStartEvent':
        return t('Start')
      case 'VideoPlayEvent':
        return t('Play')
      case 'VideoPauseEvent':
        return t('Pause')
      case 'VideoCompleteEvent':
        return t('Complete')
      case 'VideoProgressEvent':
        return t('Progress')
      default:
        return t('Not found')
    }
  }

  const handleSelectAllVideoEvents = (checked: boolean): void => {
    setCheckboxState((prev) => ({
      ...prev,
      VideoStartEvent: checked,
      VideoPlayEvent: checked,
      VideoPauseEvent: checked,
      VideoCompleteEvent: checked,
      VideoProgressEvent: checked
    }))
  }

  const handleSelectAll = (checked: boolean): void => {
    setCheckboxState({
      JourneyViewEvent: checked,
      ChatOpenEvent: checked,
      TextResponseSubmissionEvent: checked,
      RadioQuestionSubmissionEvent: checked,
      ButtonClickEvent: checked,
      SignUpSubmissionEvent: checked,
      VideoStartEvent: checked,
      VideoPlayEvent: checked,
      VideoPauseEvent: checked,
      VideoCompleteEvent: checked,
      VideoProgressEvent: checked
    })
  }

  useEffect(() => {
    const someVideosSelected = VIDEO_EVENT_KEYS.some(
      (event) => checkboxState[event.key]
    )
    const allVideosSelected = VIDEO_EVENT_KEYS.every(
      (event) => checkboxState[event.key]
    )
    const allRegularEventsSelected = REGULAR_EVENT_KEYS.every(
      (event) => checkboxState[event.key]
    )

    setVideoEventsSelected(
      allVideosSelected ? 'all' : someVideosSelected ? 'some' : 'none'
    )
    setSelectAll(allRegularEventsSelected && allVideosSelected)

    const events: string[] = []
    forIn(checkboxState, (value, key) => {
      if (value) {
        events.push(EventType[key])
      }
    })
    setSelectedEvents(events)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkboxState, setSelectedEvents])

  return (
    <Stack>
      <FormGroup>
        <CheckboxOption
          checked={selectAll}
          onChange={handleSelectAll}
          label={t('All')}
        />
        <Divider sx={{ my: 1 }} />
        <Box
          sx={{
            '& .MuiCheckbox-root': {
              color: 'text.disabled'
            }
          }}
        >
          <CheckboxOption
            checked={true}
            onChange={() => undefined}
            label={
              <Box>
                <Typography variant="body2">{t('Contact Data')}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {t(
                    'All contact data {name, email, phone} is exported by default'
                  )}
                </Typography>
              </Box>
            }
          />
        </Box>
        {/* Regular events */}
        {REGULAR_EVENT_KEYS.map((event) => (
          <CheckboxOption
            key={event.key}
            checked={checkboxState[event.key]}
            onChange={(checked) => {
              setCheckboxState((prev) => ({ ...prev, [event.key]: checked }))
            }}
            label={event.label}
          />
        ))}
        {/* Video events section */}
        <Box
          onClick={() => setVideoEventsExpanded(!videoEventsExpanded)}
          data-testid="video-events-expander"
          sx={{
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'action.hover'
            },
            ml: -3,
            pl: 3
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ pr: 2 }}
          >
            <CheckboxOption
              checked={videoEventsSelected === 'all'}
              onChange={(checked) => {
                handleSelectAllVideoEvents(checked)
              }}
              label={t('Video Interactions')}
              onClick={(e) => e.stopPropagation()}
              indeterminate={videoEventsSelected === 'some'}
            />
            <IconButton size="small" sx={{ pointerEvents: 'none' }}>
              {videoEventsExpanded ? <ChevronUp /> : <ChevronDown />}
            </IconButton>
          </Stack>
        </Box>
        {/* Video events checkboxes */}
        <Collapse in={videoEventsExpanded} sx={{ ml: 3 }}>
          <Stack>
            {VIDEO_EVENT_KEYS.map((event) => (
              <CheckboxOption
                key={event.key}
                checked={checkboxState[event.key]}
                onChange={(checked) => {
                  setCheckboxState((prev) => ({
                    ...prev,
                    [event.key]: checked
                  }))
                }}
                label={event.label}
              />
            ))}
          </Stack>
        </Collapse>
      </FormGroup>
    </Stack>
  )
}
