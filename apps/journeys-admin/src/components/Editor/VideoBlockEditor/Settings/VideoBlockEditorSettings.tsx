import { ChangeEvent, ReactElement } from 'react'
import {
  Divider,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import { Box } from '@mui/system'
import { TreeBlock } from '@core/journeys/ui'
import { noop } from 'lodash'
import { useFormik } from 'formik'
import TimeField from 'react-simple-timefield'
import { PlayCircle, StopCircle } from '@mui/icons-material'

import {
  GetJourney_journey_blocks_VideoBlock as VideoBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../../__generated__/GetJourney'
import {
  secondsToTimeFormat,
  timeFormatToSeconds
} from '../../../../libs/timeFormat'
import { VideoBlockEditorSettingsPoster } from './Poster/VideoBlockEditorSettingsPoster'

interface VideoBlockEditorSettingsProps {
  selectedBlock: TreeBlock<VideoBlock> | null
  posterBlock: ImageBlock | null
  parentOrder?: number
  disabled?: boolean
  onChange: (block: TreeBlock<VideoBlock>) => Promise<void>
}

export function VideoBlockEditorSettings({
  selectedBlock,
  posterBlock,
  parentOrder = 0,
  disabled = false,
  onChange
}: VideoBlockEditorSettingsProps): ReactElement {
  const theme = useTheme()
  const handleTimeChange = async (
    target: string,
    e: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const time = e.target.value
    const timeInSeconds = timeFormatToSeconds(time)
    if (selectedBlock?.[target] === timeInSeconds) return

    const block = {
      ...selectedBlock,
      [target]: timeInSeconds
    }
    await onChange(block as TreeBlock<VideoBlock>)
  }

  const handleSwitchChange = async (
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const value = event.target.checked
    if (selectedBlock?.autoplay === value) return

    const block = {
      ...selectedBlock,
      [event.target.name]: value
    }
    await onChange(block as TreeBlock<VideoBlock>)
  }

  const formik = useFormik({
    initialValues: {
      startAt: secondsToTimeFormat(selectedBlock?.startAt ?? 0),
      endAt: secondsToTimeFormat(selectedBlock?.endAt ?? 0)
    },
    onSubmit: noop
  })

  return (
    <Box sx={{ px: 6, py: 3, width: '100%' }}>
      <Stack direction="column" spacing={3}>
        <Stack direction="row" justifyContent="space-between">
          <Stack direction="column">
            <Typography
              variant="subtitle2"
              color={disabled ? theme.palette.action.disabled : ''}
            >
              Autoplay
            </Typography>
            <Typography
              variant="caption"
              color={disabled ? theme.palette.action.disabled : ''}
            >
              Start video automatically when card appears
            </Typography>
          </Stack>
          <Switch
            checked={selectedBlock?.autoplay ?? true}
            name="autoplay"
            onChange={handleSwitchChange}
            disabled={disabled}
          />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Stack direction="column">
            <Typography
              variant="subtitle2"
              color={disabled ? theme.palette.action.disabled : ''}
            >
              Muted
            </Typography>
            <Typography
              variant="caption"
              color={disabled ? theme.palette.action.disabled : ''}
            >
              Video always muted on the first card
            </Typography>
          </Stack>
          <Switch
            checked={selectedBlock?.muted ?? parentOrder === 0}
            name="muted"
            onChange={handleSwitchChange}
            disabled={disabled}
          />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-around" spacing={3}>
          <TimeField
            showSeconds
            value={formik.values.startAt}
            style={{ width: '100%' }}
            onChange={formik.handleChange}
            input={
              <TextField
                id="startAt"
                name="startAt"
                label="Starts At"
                value={formik.values.startAt}
                variant="filled"
                disabled={disabled}
                onBlur={async (e) => {
                  formik.handleBlur(e)
                  await handleTimeChange(
                    'startAt',
                    e as ChangeEvent<HTMLInputElement>
                  )
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PlayCircle />
                    </InputAdornment>
                  )
                }}
              />
            }
          />
          <TimeField
            showSeconds
            value={formik.values.endAt}
            onChange={formik.handleChange}
            style={{ width: '100%' }}
            input={
              <TextField
                id="endAt"
                name="endAt"
                label="Ends At"
                value={formik.values.endAt}
                variant="filled"
                disabled={disabled}
                onBlur={async (e) => {
                  formik.handleBlur(e)
                  await handleTimeChange(
                    'endAt',
                    e as ChangeEvent<HTMLInputElement>
                  )
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <StopCircle />
                    </InputAdornment>
                  )
                }}
              />
            }
          />
        </Stack>
        <Divider />
        <VideoBlockEditorSettingsPoster
          selectedBlock={posterBlock}
          parentBlockId={selectedBlock?.id}
          disabled={disabled}
        />
      </Stack>
    </Box>
  )
}
