import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Collapse from '@mui/material/Collapse'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { DateField } from '@mui/x-date-pickers/DateField'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { EventType } from '../../../../../__generated__/globalTypes'

interface DateRangePickerProps {
  startDate: Date | null
  endDate: Date | null
  onStartDateChange: (date: Date | null) => void
  onEndDateChange: (date: Date | null) => void
}

function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}: DateRangePickerProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack direction="row" spacing={2}>
        <DateField
          label={t('Start Date')}
          value={startDate}
          onChange={onStartDateChange}
          format="dd-MM-yyyy"
        />
        <DateField
          label={t('End Date')}
          value={endDate}
          onChange={onEndDateChange}
          format="dd-MM-yyyy"
        />
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
        />
      </Box>
      <Box sx={{ p: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t('Select visitors actions')}
        </Typography>
        <Stack spacing={2}>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              }
              label={t('All')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={journeyView}
                  onChange={(e) => setJourneyView(e.target.checked)}
                />
              }
              label={t('Journey Start')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={chatOpened}
                  onChange={(e) => setChatOpened(e.target.checked)}
                />
              }
              label={t('Chat Open')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={textSubmission}
                  onChange={(e) => setTextSubmission(e.target.checked)}
                />
              }
              label={t('Text Submission')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={pollOptions}
                  onChange={(e) => setPollOptions(e.target.checked)}
                />
              }
              label={t('Poll Selection')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={buttonClicks}
                  onChange={(e) => setButtonClicks(e.target.checked)}
                />
              }
              label={t('Button Click')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={subscription}
                  onChange={(e) => setSubscription(e.target.checked)}
                />
              }
              label={t('Subscription')}
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
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={videoEventsParent}
                        indeterminate={
                          !allVideoEventsSelected && someVideoEventsSelected
                        }
                        onChange={(e) => {
                          e.stopPropagation()
                          handleVideoEventsParentChange(e.target.checked)
                        }}
                      />
                    }
                    label={t('Video Interaction')}
                    onClick={(e) => e.stopPropagation()}
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
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={videoEvents.start}
                          onChange={(e) =>
                            handleVideoEventChange('start', e.target.checked)
                          }
                        />
                      }
                      label={t('Start')}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={videoEvents.play}
                          onChange={(e) =>
                            handleVideoEventChange('play', e.target.checked)
                          }
                        />
                      }
                      label={t('Play')}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={videoEvents.pause}
                          onChange={(e) =>
                            handleVideoEventChange('pause', e.target.checked)
                          }
                        />
                      }
                      label={t('Pause')}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={videoEvents.complete}
                          onChange={(e) =>
                            handleVideoEventChange('complete', e.target.checked)
                          }
                        />
                      }
                      label={t('Complete')}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={videoEvents.progress}
                          onChange={(e) =>
                            handleVideoEventChange('progress', e.target.checked)
                          }
                        />
                      }
                      label={t('Progress')}
                    />
                  </FormGroup>
                </Box>
              </Collapse>
            </Box>
          </FormGroup>
        </Stack>
      </Box>
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={getSelectedEvents().length === 0}
        >
          {t('Export (CSV)')}
        </Button>
      </Box>
    </Dialog>
  )
}
