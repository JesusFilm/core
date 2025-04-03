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
import forIn from 'lodash/forIn'
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

interface CheckboxState {
  journeyView: boolean
  chatOpened: boolean
  textSubmission: boolean
  pollOptions: boolean
  buttonClicks: boolean
  subscription: boolean
  videoEvents: {
    start: boolean
    play: boolean
    pause: boolean
    complete: boolean
    progress: boolean
  }
}

export function ExportDialog({
  open,
  onClose,
  onExport
}: ExportDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const [checkboxState, setCheckboxState] = useState<CheckboxState>({
    journeyView: true,
    chatOpened: true,
    textSubmission: true,
    pollOptions: true,
    buttonClicks: true,
    subscription: true,
    videoEvents: {
      start: true,
      play: true,
      pause: true,
      complete: true,
      progress: true
    }
  })

  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const [selectAll, setSelectAll] = useState(true)

  const [videoEventsParent, setVideoEventsParent] = useState(true)

  const [videoEventsExpanded, setVideoEventsExpanded] = useState(false)

  const handleVideoEventChange = (event: string, checked: boolean): void => {
    setCheckboxState((prev) => ({
      ...prev,
      videoEvents: {
        ...prev.videoEvents,
        [event]: checked
      }
    }))
  }

  const allVideoEventsSelected = Object.values(checkboxState.videoEvents).every(
    (value) => value === true
  )

  const someVideoEventsSelected = Object.values(checkboxState.videoEvents).some(
    (value) => value === true
  )

  const handleVideoEventsParentChange = (checked: boolean): void => {
    setVideoEventsParent(checked)
    setCheckboxState((prev) => ({
      ...prev,
      videoEvents: {
        start: checked,
        play: checked,
        pause: checked,
        complete: checked,
        progress: checked
      }
    }))
  }

  const handleSelectAll = (checked: boolean): void => {
    setSelectAll(checked)
    setCheckboxState({
      journeyView: checked,
      chatOpened: checked,
      textSubmission: checked,
      pollOptions: checked,
      buttonClicks: checked,
      subscription: checked,
      videoEvents: {
        start: checked,
        play: checked,
        pause: checked,
        complete: checked,
        progress: checked
      }
    })
    setVideoEventsParent(checked)
  }

  useEffect(() => {
    const allSelected =
      checkboxState.journeyView &&
      checkboxState.chatOpened &&
      checkboxState.textSubmission &&
      checkboxState.pollOptions &&
      checkboxState.buttonClicks &&
      checkboxState.subscription &&
      allVideoEventsSelected

    setSelectAll(allSelected)
  }, [checkboxState, allVideoEventsSelected])

  // Convert checkbox states to EventType array for export
  const getSelectedEvents = (): EventType[] => {
    const events: EventType[] = []

    forIn(checkboxState, (value, key) => {
      if (key === 'videoEvents') {
        forIn(value, (checked, videoKey) => {
          if (checked) {
            switch (videoKey) {
              case 'start':
                events.push(EventType.VideoStartEvent)
                break
              case 'play':
                events.push(EventType.VideoPlayEvent)
                break
              case 'pause':
                events.push(EventType.VideoPauseEvent)
                break
              case 'complete':
                events.push(EventType.VideoCompleteEvent)
                break
              case 'progress':
                events.push(EventType.VideoProgressEvent)
                break
            }
          }
        })
      } else if (value) {
        switch (key) {
          case 'journeyView':
            events.push(EventType.JourneyViewEvent)
            break
          case 'chatOpened':
            events.push(EventType.ChatOpenEvent)
            break
          case 'textSubmission':
            events.push(EventType.TextResponseSubmissionEvent)
            break
          case 'pollOptions':
            events.push(EventType.RadioQuestionSubmissionEvent)
            break
          case 'buttonClicks':
            events.push(EventType.ButtonClickEvent)
            break
          case 'subscription':
            events.push(EventType.SignUpSubmissionEvent)
            break
        }
      }
    })

    return events
  }

  const handleExport = async (): Promise<void> => {
    console.log(getSelectedEvents())
    // await onExport(getSelectedEvents())
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
              checked={checkboxState.journeyView}
              onChange={(checked) =>
                setCheckboxState((prev) => ({ ...prev, journeyView: checked }))
              }
              label="Journey Start"
            />
            <CheckboxOption
              checked={checkboxState.chatOpened}
              onChange={(checked) =>
                setCheckboxState((prev) => ({ ...prev, chatOpened: checked }))
              }
              label="Chat Open"
            />
            <CheckboxOption
              checked={checkboxState.textSubmission}
              onChange={(checked) =>
                setCheckboxState((prev) => ({
                  ...prev,
                  textSubmission: checked
                }))
              }
              label="Text Submission"
            />
            <CheckboxOption
              checked={checkboxState.pollOptions}
              onChange={(checked) =>
                setCheckboxState((prev) => ({ ...prev, pollOptions: checked }))
              }
              label="Poll Selection"
            />
            <CheckboxOption
              checked={checkboxState.buttonClicks}
              onChange={(checked) =>
                setCheckboxState((prev) => ({ ...prev, buttonClicks: checked }))
              }
              label="Button Click"
            />
            <CheckboxOption
              checked={checkboxState.subscription}
              onChange={(checked) =>
                setCheckboxState((prev) => ({ ...prev, subscription: checked }))
              }
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
                      checked={checkboxState.videoEvents.start}
                      onChange={(checked) =>
                        handleVideoEventChange('start', checked)
                      }
                      label="Start"
                    />
                    <CheckboxOption
                      checked={checkboxState.videoEvents.play}
                      onChange={(checked) =>
                        handleVideoEventChange('play', checked)
                      }
                      label="Play"
                    />
                    <CheckboxOption
                      checked={checkboxState.videoEvents.pause}
                      onChange={(checked) =>
                        handleVideoEventChange('pause', checked)
                      }
                      label="Pause"
                    />
                    <CheckboxOption
                      checked={checkboxState.videoEvents.complete}
                      onChange={(checked) =>
                        handleVideoEventChange('complete', checked)
                      }
                      label="Complete"
                    />
                    <CheckboxOption
                      checked={checkboxState.videoEvents.progress}
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
