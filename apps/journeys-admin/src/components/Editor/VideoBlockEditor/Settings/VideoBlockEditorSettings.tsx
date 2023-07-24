import { ReactElement } from 'react'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Box from '@mui/material/Box'
import type { TreeBlock } from '@core/journeys/ui/block'
import noop from 'lodash/noop'
import { useFormik } from 'formik'
import TimeField from 'react-simple-timefield'
import PlayCircle from '@mui/icons-material/PlayCircle'
import StopCircle from '@mui/icons-material/StopCircle'
import { useSnackbar } from 'notistack'
import {
  secondsToTimeFormat,
  timeFormatToSeconds
} from '@core/shared/ui/timeFormat'

import {
  GetJourney_journey_blocks_VideoBlock as VideoBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../../__generated__/GetJourney'
import {
  VideoBlockObjectFit as ObjectFit,
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../__generated__/globalTypes'
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
  const { enqueueSnackbar } = useSnackbar()
  const { values, errors, handleChange, setFieldValue } = useFormik({
    initialValues: {
      autoplay: selectedBlock?.autoplay ?? true,
      muted: selectedBlock?.muted ?? true,
      startAt: secondsToTimeFormat(selectedBlock?.startAt ?? 0),
      endAt: secondsToTimeFormat(selectedBlock?.endAt ?? 0),
      objectFit: selectedBlock?.objectFit ?? ObjectFit.fill
    },
    enableReinitialize: true,
    validate: async (values) => {
      const convertedStartAt = timeFormatToSeconds(values.startAt)
      const convertedEndAt = timeFormatToSeconds(values.endAt)
      if (convertedStartAt > convertedEndAt - 3) {
        errors.startAt =
          'Start time has to be at least 3 seconds less than end time'
        enqueueSnackbar(errors.startAt, {
          variant: 'error',
          preventDuplicate: true
        })
      } else if (
        selectedBlock?.duration != null &&
        convertedStartAt > selectedBlock?.duration - 3
      ) {
        errors.startAt = `Start time has to be at least 3 seconds less than video duration ${secondsToTimeFormat(
          selectedBlock?.duration
        )}`
        enqueueSnackbar(errors.startAt, {
          variant: 'error',
          preventDuplicate: true
        })
      } else if (
        selectedBlock?.duration != null &&
        convertedEndAt > selectedBlock?.duration
      ) {
        errors.endAt = `End time has to be no more than video duration ${secondsToTimeFormat(
          selectedBlock?.duration
        )}`
        enqueueSnackbar(errors.endAt, {
          variant: 'error',
          preventDuplicate: true
        })
      } else {
        await onChange({
          ...values,
          startAt: convertedStartAt,
          endAt: convertedEndAt
        })
      }
      return errors
    },
    onSubmit: noop
  })

  return (
    <Box sx={{ px: 6, py: 3, width: '100%' }}>
      <Stack direction="column" spacing={3}>
        <Stack direction="column" spacing={3}>
          <Typography
            variant="subtitle2"
            sx={{
              color:
                selectedBlock == null || selectedBlock.parentOrder == null
                  ? 'action.disabled'
                  : undefined
            }}
          >
            Timing
          </Typography>
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
              value={values.endAt}
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
        </Stack>
        <Stack direction="column" spacing={3}>
          <Stack>
            <Typography
              variant="subtitle2"
              sx={{
                color:
                  selectedBlock == null ||
                  selectedBlock.parentOrder == null ||
                  selectedBlock?.source === VideoBlockSource.youTube
                    ? 'action.disabled'
                    : undefined
              }}
            >
              Aspect ratio
            </Typography>
            {selectedBlock?.source === VideoBlockSource.youTube && (
              <Typography variant="caption" color="action.disabled">
                This option is not available for YouTube videos
              </Typography>
            )}
          </Stack>
          <ToggleButtonGroup
            value={
              selectedBlock?.source === VideoBlockSource.youTube
                ? ObjectFit.fit
                : values.objectFit
            }
            exclusive
            fullWidth
            onChange={async (_event, value) => {
              if (value != null) await setFieldValue('objectFit', value)
            }}
            aria-label="Object Fit"
            disabled={selectedBlock?.source === VideoBlockSource.youTube}
          >
            <ToggleButton
              sx={{
                '&.Mui-selected': {
                  color: 'primary.main'
                }
              }}
              value={ObjectFit.fill}
            >
              Fill
            </ToggleButton>
            <ToggleButton
              sx={{
                '&.Mui-selected': {
                  color: 'primary.main'
                }
              }}
              value={ObjectFit.fit}
            >
              Fit
            </ToggleButton>
            <ToggleButton
              sx={{
                '&.Mui-selected': {
                  color: 'primary.main'
                }
              }}
              value={ObjectFit.zoomed}
            >
              Crop
            </ToggleButton>
          </ToggleButtonGroup>
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
        <VideoBlockEditorSettingsPoster
          selectedBlock={posterBlock}
          parentBlockId={selectedBlock?.id}
          disabled={selectedBlock == null}
        />
      </Stack>
    </Box>
  )
}
