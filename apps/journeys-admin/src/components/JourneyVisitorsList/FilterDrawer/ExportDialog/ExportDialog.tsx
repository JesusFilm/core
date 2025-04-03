import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import FormGroup from '@mui/material/FormGroup'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { DateField } from '@mui/x-date-pickers/DateField'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { EventType } from '../../../../../__generated__/globalTypes'

import { CheckboxOption } from './CheckboxOption'

interface DateRangePickerProps {
  startDate: Date | null
  endDate: Date | null
  onStartDateChange: (date: Date | null) => void
  onEndDateChange: (date: Date | null) => void
  startDateError: string | null
  endDateError: string | null
}

function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startDateError,
  endDateError
}: DateRangePickerProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack direction="row" spacing={2} alignItems="center">
        <CalendarTodayIcon sx={{ color: 'text.secondary' }} />
        <Stack direction="row" spacing={2} sx={{ '& > *': { flex: 1 } }}>
          <DateField
            size="small"
            label={t('Start Date')}
            value={startDate}
            onChange={onStartDateChange}
            format="dd-MM-yyyy"
            clearable
            slotProps={{
              textField: {
                error: startDateError != null,
                helperText: startDateError
              }
            }}
          />
          <DateField
            size="small"
            label={t('End Date')}
            value={endDate}
            onChange={onEndDateChange}
            format="dd-MM-yyyy"
            clearable
            slotProps={{
              textField: {
                error: endDateError != null,
                helperText: endDateError
              }
            }}
          />
        </Stack>
      </Stack>
    </LocalizationProvider>
  )
}

interface ExportDialogProps {
  open: boolean
  onClose: () => void
  onExport: (selectedEvents: EventType[]) => Promise<void>
}

interface VideoEventsState {
  start: boolean
  play: boolean
  pause: boolean
  complete: boolean
  progress: boolean
}

export function ExportDialog({
  open,
  onClose,
  onExport
}: ExportDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  // Individual checkbox states
  const [journeyView, setJourneyView] = useState(true)
  const [chatOpened, setChatOpened] = useState(true)
  const [textSubmission, setTextSubmission] = useState(true)
  const [pollOptions, setPollOptions] = useState(true)
  const [buttonClicks, setButtonClicks] = useState(true)
  const [subscription, setSubscription] = useState(true)
  const [videoEvents, setVideoEvents] = useState<VideoEventsState>({
    start: true,
    play: true,
    pause: true,
    complete: true,
    progress: true
  })

  // Date range state
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  // All checkbox state
  const [selectAll, setSelectAll] = useState(true)

  // Video events parent checkbox state
  const [videoEventsParent, setVideoEventsParent] = useState(true)

  // Add state for video events collapse
  const [videoEventsExpanded, setVideoEventsExpanded] = useState(false)

  // Handle individual video event changes
  const handleVideoEventChange = (event: string, checked: boolean): void => {
    setVideoEvents((prev) => ({ ...prev, [event]: checked }))
  }

  // Check if all video events are selected
  const allVideoEventsSelected = Object.values(videoEvents).every(
    (value) => value === true
  )

  // Check if some video events are selected
  const someVideoEventsSelected = Object.values(videoEvents).some(
    (value) => value === true
  )

  // Handle video events parent checkbox
  const handleVideoEventsParentChange = (checked: boolean): void => {
    setVideoEventsParent(checked)
    setVideoEvents({
      start: checked,
      play: checked,
      pause: checked,
      complete: checked,
      progress: checked
    })
  }

  // Update video events parent state based on children
  useEffect(() => {
    setVideoEventsParent(allVideoEventsSelected)
  }, [allVideoEventsSelected])

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean): void => {
    setSelectAll(checked)
    setJourneyView(checked)
    setChatOpened(checked)
    setTextSubmission(checked)
    setPollOptions(checked)
    setButtonClicks(checked)
    setSubscription(checked)
    handleVideoEventsParentChange(checked)
  }

  // Update select all state when any checkbox changes
  useEffect(() => {
    const allSelected =
      journeyView &&
      chatOpened &&
      textSubmission &&
      pollOptions &&
      buttonClicks &&
      subscription &&
      allVideoEventsSelected

    setSelectAll(allSelected)
  }, [
    journeyView,
    chatOpened,
    textSubmission,
    pollOptions,
    buttonClicks,
    subscription,
    allVideoEventsSelected
  ])

  // Convert checkbox states to EventType array for export
  const getSelectedEvents = (): EventType[] => {
    const events: EventType[] = []

    if (journeyView) events.push(EventType.JourneyViewEvent)
    if (chatOpened) events.push(EventType.ChatOpenEvent)
    if (textSubmission) events.push(EventType.TextResponseSubmissionEvent)
    if (pollOptions) events.push(EventType.RadioQuestionSubmissionEvent)
    if (buttonClicks) events.push(EventType.ButtonClickEvent)
    if (subscription) events.push(EventType.SignUpSubmissionEvent)
    if (videoEvents.start) events.push(EventType.VideoStartEvent)
    if (videoEvents.play) events.push(EventType.VideoPlayEvent)
    if (videoEvents.pause) events.push(EventType.VideoPauseEvent)
    if (videoEvents.complete) events.push(EventType.VideoCompleteEvent)
    if (videoEvents.progress) events.push(EventType.VideoProgressEvent)

    return events
  }

  const handleExport = async (): Promise<void> => {
    await onExport(getSelectedEvents())
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dialogTitle={{
        title: t('Export Analytics'),
        closeButton: true
      }}
      divider
      dialogActionChildren={
        <Button
          variant="contained"
          color="secondary"
          onClick={handleExport}
          disabled={getSelectedEvents().length === 0}
        >
          {t('Export (CSV)')}
        </Button>
      }
    >
      <Box sx={{ px: 4 }}>
        <Box sx={{ pb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('Select date range (optional)')}
          </Typography>
        </Box>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          startDateError={null}
          endDateError={null}
        />
      </Box>
      <Box sx={{ p: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t('Select visitors actions')}
        </Typography>
        <Stack spacing={2}>
          <FormGroup>
            <CheckboxOption
              checked={selectAll}
              onChange={handleSelectAll}
              label="All"
            />
            <CheckboxOption
              checked={journeyView}
              onChange={setJourneyView}
              label="Journey Start"
            />
            <CheckboxOption
              checked={chatOpened}
              onChange={setChatOpened}
              label="Chat Open"
            />
            <CheckboxOption
              checked={textSubmission}
              onChange={setTextSubmission}
              label="Text Submission"
            />
            <CheckboxOption
              checked={pollOptions}
              onChange={setPollOptions}
              label="Poll Selection"
            />
            <CheckboxOption
              checked={buttonClicks}
              onChange={setButtonClicks}
              label="Button Click"
            />
            <CheckboxOption
              checked={subscription}
              onChange={setSubscription}
              label="Subscription"
            />
            <Box>
              <Box
                onClick={() => setVideoEventsExpanded(!videoEventsExpanded)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  },
                  mx: -3,
                  px: 3
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ pr: 2 }}
                >
                  <CheckboxOption
                    checked={videoEventsParent}
                    onChange={(checked) => {
                      handleVideoEventsParentChange(checked)
                    }}
                    label="Video Interaction"
                    onClick={(e) => e.stopPropagation()}
                    indeterminate={
                      !allVideoEventsSelected && someVideoEventsSelected
                    }
                  />
                  <IconButton size="small" sx={{ pointerEvents: 'none' }}>
                    {videoEventsExpanded ? (
                      <KeyboardArrowUpIcon />
                    ) : (
                      <KeyboardArrowDownIcon />
                    )}
                  </IconButton>
                </Stack>
              </Box>
              <Collapse in={videoEventsExpanded}>
                <Box sx={{ ml: 3 }}>
                  <FormGroup>
                    <CheckboxOption
                      checked={videoEvents.start}
                      onChange={(checked) =>
                        handleVideoEventChange('start', checked)
                      }
                      label="Start"
                    />
                    <CheckboxOption
                      checked={videoEvents.play}
                      onChange={(checked) =>
                        handleVideoEventChange('play', checked)
                      }
                      label="Play"
                    />
                    <CheckboxOption
                      checked={videoEvents.pause}
                      onChange={(checked) =>
                        handleVideoEventChange('pause', checked)
                      }
                      label="Pause"
                    />
                    <CheckboxOption
                      checked={videoEvents.complete}
                      onChange={(checked) =>
                        handleVideoEventChange('complete', checked)
                      }
                      label="Complete"
                    />
                    <CheckboxOption
                      checked={videoEvents.progress}
                      onChange={(checked) =>
                        handleVideoEventChange('progress', checked)
                      }
                      label="Progress"
                    />
                  </FormGroup>
                </Box>
              </Collapse>
            </Box>
          </FormGroup>
        </Stack>
      </Box>
    </Dialog>
  )
}
