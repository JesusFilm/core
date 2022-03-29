import { ReactElement } from 'react'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
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
import { VideoBlockUpdateInput } from '../../../../../__generated__/globalTypes'
import { VideoBlockEditorSettingsPoster } from './Poster/VideoBlockEditorSettingsPoster'

interface VideoBlockEditorSettingsProps {
  selectedBlock: TreeBlock<VideoBlock> | null
  posterBlock: ImageBlock | null
  onChange: (input: VideoBlockUpdateInput) => Promise<void>
}

export function VideoBlockEditorSettings({
  selectedBlock,
  posterBlock,
  onChange
}: VideoBlockEditorSettingsProps): ReactElement {
  const { values, handleChange } = useFormik({
    initialValues: {
      autoplay: selectedBlock?.autoplay ?? true,
      muted: selectedBlock?.muted ?? true,
      startAt: secondsToTimeFormat(selectedBlock?.startAt ?? 0),
      endAt: secondsToTimeFormat(selectedBlock?.endAt ?? 0)
    },
    validate: async (values) => {
      await onChange({
        ...values,
        startAt: timeFormatToSeconds(values.startAt),
        endAt: timeFormatToSeconds(values.endAt)
      })
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
              sx={{
                color:
                  selectedBlock == null || selectedBlock.parentOrder == null
                    ? 'action.disabled'
                    : undefined
              }}
            >
              Autoplay
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color:
                  selectedBlock == null || selectedBlock.parentOrder == null
                    ? 'action.disabled'
                    : undefined
              }}
            >
              Start video automatically when card appears
            </Typography>
          </Stack>
          <Switch
            checked={values.autoplay}
            name="autoplay"
            onChange={handleChange}
            disabled={
              selectedBlock == null || selectedBlock.parentOrder == null
            }
            inputProps={{
              'aria-label': 'Autoplay'
            }}
          />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Stack direction="column">
            <Typography
              variant="subtitle2"
              sx={{
                color:
                  selectedBlock == null || selectedBlock.parentOrder == null
                    ? 'action.disabled'
                    : undefined
              }}
            >
              Muted
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color:
                  selectedBlock == null || selectedBlock.parentOrder == null
                    ? 'action.disabled'
                    : undefined
              }}
            >
              Video always muted on the first card
            </Typography>
          </Stack>
          <Switch
            checked={values.muted}
            name="muted"
            onChange={handleChange}
            disabled={
              selectedBlock == null || selectedBlock.parentOrder == null
            }
            inputProps={{
              'aria-label': 'Muted'
            }}
          />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-around" spacing={3}>
          <TimeField
            showSeconds
            value={values.startAt}
            onChange={handleChange}
            style={{ width: '100%' }}
            input={
              <TextField
                label="Starts At"
                name="startAt"
                value={values.startAt}
                variant="filled"
                disabled={selectedBlock == null}
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
            onChange={handleChange}
            style={{ width: '100%' }}
            input={
              <TextField
                label="Ends At"
                name="endAt"
                value={values.endAt}
                variant="filled"
                disabled={selectedBlock == null}
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
          disabled={selectedBlock == null}
        />
      </Stack>
    </Box>
  )
}
