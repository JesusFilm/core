import { ReactElement, useState } from 'react'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
// import Button from '@mui/material/Button'
// import ButtonGroup from '@mui/material/ButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup  from '@mui/material/ToggleButtonGroup'
import Box from '@mui/material/Box'
import type { TreeBlock } from '@core/journeys/ui/block'
import { noop } from 'lodash'
import { useFormik } from 'formik'
import TimeField from 'react-simple-timefield'
import PlayCircle from '@mui/icons-material/PlayCircle'
import StopCircle from '@mui/icons-material/StopCircle'
import {
  secondsToTimeFormat,
  timeFormatToSeconds
} from '@core/shared/ui/timeFormat'

import {
  GetJourney_journey_blocks_VideoBlock as VideoBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../../__generated__/GetJourney'
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
    enableReinitialize: true,
    validate: async (values) => {
      await onChange({
        ...values,
        startAt: timeFormatToSeconds(values.startAt),
        endAt: timeFormatToSeconds(values.endAt)
      })
    },
    onSubmit: noop
  })

  const [aspectRatio, setAspectRatio] = useState('fill');

  const handleAspectRatioChange = (
    event: React.MouseEvent<HTMLElement>,
    newAspectRatio: string,
  ) :void  =>  {
    setAspectRatio(newAspectRatio);
    // TODO: this could be where we update the objectFit on video block?
    // merge backend changes into this branch, once it's been approved
    // need to call videoblock update mutation method
    // add objectFit to videoFields.ts, run codegen
    // add objectFit to props in Video.tsx
    // Find out how to make a video fill fit or zoom on video.tsx
  };

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
          <Typography
            variant="subtitle2"
            sx={{
              color:
                selectedBlock == null || selectedBlock.parentOrder == null
                  ? 'action.disabled'
                  : undefined
            }}
          >
            Aspect ratio
          </Typography>
          <ToggleButtonGroup
            color="primary"
            value={aspectRatio}
            exclusive
            fullWidth
            onChange={handleAspectRatioChange}
            aria-label="Platform"
          >
            <ToggleButton value="fill">Fill</ToggleButton>
            <ToggleButton value="fit">Fit</ToggleButton>
            <ToggleButton value="zoomed">Zoomed</ToggleButton>
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
