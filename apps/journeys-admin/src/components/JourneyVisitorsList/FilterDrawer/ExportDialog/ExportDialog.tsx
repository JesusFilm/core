import { gql, useQuery } from '@apollo/client'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import FormGroup from '@mui/material/FormGroup'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import forIn from 'lodash/forIn'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { EventType } from '../../../../../__generated__/globalTypes'
import { useJourneyEventsExport } from '../../../../libs/useJourneyEventsExport'
import { DateRangePicker } from '../../../DateRangePicker'

import { CheckboxOption } from './CheckboxOption'

export const GET_JOURNEY_CREATED_AT = gql`
  query GetJourneyCreatedAt($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      id
      createdAt
    }
  }
`

interface ExportDialogProps {
  open: boolean
  onClose: () => void
  journeyId: string
}

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

const VIDEO_EVENT_KEYS = [
  'VideoStartEvent',
  'VideoPlayEvent',
  'VideoPauseEvent',
  'VideoCompleteEvent',
  'VideoProgressEvent'
] as const

const REGULAR_EVENT_KEYS = [
  'JourneyViewEvent',
  'ChatOpenEvent',
  'TextResponseSubmissionEvent',
  'RadioQuestionSubmissionEvent',
  'ButtonClickEvent',
  'SignUpSubmissionEvent'
] as const

export function ExportDialog({
  open,
  onClose,
  journeyId
}: ExportDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { exportJourneyEvents } = useJourneyEventsExport()
  const { data: journeyData } = useQuery(GET_JOURNEY_CREATED_AT, {
    variables: { id: journeyId }
  })

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

  const [startDate, setStartDate] = useState<Date | null>(() =>
    journeyData?.journey?.createdAt
      ? new Date(journeyData.journey.createdAt)
      : null
  )
  const [endDate, setEndDate] = useState<Date | null>(new Date())

  useEffect(() => {
    if (journeyData?.journey?.createdAt != null) {
      setStartDate(new Date(journeyData.journey.createdAt))
    }
  }, [journeyData?.journey?.createdAt])

  const [selectAll, setSelectAll] = useState(true)

  const [videoEventsExpanded, setVideoEventsExpanded] = useState(false)

  const [videoEventsSelected, setVideoEventsSelected] = useState<
    'all' | 'some' | 'none'
  >('all')

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
      (key) => checkboxState[key]
    )
    const allVideosSelected = VIDEO_EVENT_KEYS.every(
      (key) => checkboxState[key]
    )
    const allRegularEventsSelected = REGULAR_EVENT_KEYS.every(
      (key) => checkboxState[key]
    )

    setVideoEventsSelected(
      allVideosSelected ? 'all' : someVideosSelected ? 'some' : 'none'
    )
    setSelectAll(allRegularEventsSelected && allVideosSelected)
  }, [checkboxState])

  const getSelectedEvents = (): EventType[] => {
    const events: EventType[] = []

    forIn(checkboxState, (value, key) => {
      if (value) {
        events.push(EventType[key])
      }
    })
    return events
  }

  const handleExport = async (): Promise<void> => {
    try {
      const filter = {
        typenames: getSelectedEvents(),
        ...(startDate && { periodRangeStart: startDate.toISOString() }),
        ...(endDate && { periodRangeEnd: endDate.toISOString() })
      }

      await exportJourneyEvents({ journeyId, filter })
      onClose()
    } catch (error) {
      enqueueSnackbar(error.message, {
        variant: 'error'
      })
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dialogTitle={{
        title: t('Export Analytics'),
        closeButton: true
      }}
      divider={false}
      dialogActionChildren={
        <Button
          variant="contained"
          color="secondary"
          onClick={handleExport}
          disabled={getSelectedEvents().length === 0}
          sx={{
            mb: 3,
            mr: 3
          }}
        >
          {t('Export (CSV)')}
        </Button>
      }
    >
      <Box sx={{ pb: 4 }}>
        <Box sx={{ pb: 2, pt: 4, width: '100%' }}>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </Box>
      </Box>
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          {t('Select visitor actions')}
        </Typography>
        <Stack spacing={2}>
          <FormGroup>
            <CheckboxOption
              checked={selectAll}
              onChange={handleSelectAll}
              label="All"
            />
            <Box sx={{ py: 1 }}>
              <Divider />
            </Box>
            <CheckboxOption
              checked={checkboxState.JourneyViewEvent}
              onChange={(checked) =>
                setCheckboxState((prev) => ({
                  ...prev,
                  JourneyViewEvent: checked
                }))
              }
              label="Journey Start"
            />
            <CheckboxOption
              checked={checkboxState.ChatOpenEvent}
              onChange={(checked) =>
                setCheckboxState((prev) => ({
                  ...prev,
                  ChatOpenEvent: checked
                }))
              }
              label="Chat Open"
            />
            <CheckboxOption
              checked={checkboxState.TextResponseSubmissionEvent}
              onChange={(checked) =>
                setCheckboxState((prev) => ({
                  ...prev,
                  TextResponseSubmissionEvent: checked
                }))
              }
              label="Text Submission"
            />
            <CheckboxOption
              checked={checkboxState.RadioQuestionSubmissionEvent}
              onChange={(checked) =>
                setCheckboxState((prev) => ({
                  ...prev,
                  RadioQuestionSubmissionEvent: checked
                }))
              }
              label="Poll Selection"
            />
            <CheckboxOption
              checked={checkboxState.ButtonClickEvent}
              onChange={(checked) =>
                setCheckboxState((prev) => ({
                  ...prev,
                  ButtonClickEvent: checked
                }))
              }
              label="Button Click"
            />
            <CheckboxOption
              checked={checkboxState.SignUpSubmissionEvent}
              onChange={(checked) =>
                setCheckboxState((prev) => ({
                  ...prev,
                  SignUpSubmissionEvent: checked
                }))
              }
              label="Subscription"
            />
            <Box>
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
                    label="Video Events"
                    onClick={(e) => e.stopPropagation()}
                    indeterminate={videoEventsSelected === 'some'}
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
                      checked={checkboxState.VideoStartEvent}
                      onChange={(checked) =>
                        setCheckboxState((prev) => ({
                          ...prev,
                          VideoStartEvent: checked
                        }))
                      }
                      label="Start"
                    />
                    <CheckboxOption
                      checked={checkboxState.VideoPlayEvent}
                      onChange={(checked) =>
                        setCheckboxState((prev) => ({
                          ...prev,
                          VideoPlayEvent: checked
                        }))
                      }
                      label="Play"
                    />
                    <CheckboxOption
                      checked={checkboxState.VideoPauseEvent}
                      onChange={(checked) =>
                        setCheckboxState((prev) => ({
                          ...prev,
                          VideoPauseEvent: checked
                        }))
                      }
                      label="Pause"
                    />
                    <CheckboxOption
                      checked={checkboxState.VideoCompleteEvent}
                      onChange={(checked) =>
                        setCheckboxState((prev) => ({
                          ...prev,
                          VideoCompleteEvent: checked
                        }))
                      }
                      label="Complete"
                    />
                    <CheckboxOption
                      checked={checkboxState.VideoProgressEvent}
                      onChange={(checked) =>
                        setCheckboxState((prev) => ({
                          ...prev,
                          VideoProgressEvent: checked
                        }))
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
