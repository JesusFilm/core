import { ChangeEvent, ReactElement } from 'react'
import {
  Divider,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material'
import { Box } from '@mui/system'
import { TreeBlock } from '@core/journeys/ui'
import { noop } from 'lodash'
import { object, string } from 'yup'
import { useFormik } from 'formik'
import TimeField from 'react-simple-timefield'
import {
  Create,
  PlayCircle,
  StopCircle,
  Image as ImageIcon
} from '@mui/icons-material'
import Image from 'next/image'

import {
  GetJourney_journey_blocks_VideoBlock as VideoBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../../__generated__/GetJourney'
import {
  secondsToTimeFormat,
  timeFormatToSeconds
} from '../../../../libs/timeFormat/timeFormat'

interface VideoBlockEditorSettingsProps {
  selectedBlock: TreeBlock<VideoBlock> | null
  posterBlock: ImageBlock | null
  parentOrder?: number
  onChange: (block: TreeBlock<VideoBlock>) => Promise<void>
}

export function VideoBlockEditorSettings({
  selectedBlock,
  posterBlock,
  parentOrder = 0,
  onChange
}: VideoBlockEditorSettingsProps): ReactElement {
  const handleTimeChange = async (
    target: string,
    e: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const time = e.target.value
    if (await timeSchema.isValid({ [target]: time })) return
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

  const timeSchema = object().shape({
    startAt: string()
      .required('Required')
      .matches(/(?:\d\d:[012345]\d:[012345]\d)/, 'Invalid time format'),
    endAt: string()
      .required('Required')
      .matches(/(?:\d\d:[012345]\d:[012345]\d)/, 'Invalid time format')
  })

  const formik = useFormik({
    initialValues: {
      startAt: secondsToTimeFormat(selectedBlock?.startAt ?? 0),
      endAt: secondsToTimeFormat(selectedBlock?.endAt ?? 0)
    },
    validationSchema: timeSchema,
    onSubmit: noop
  })

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Stack direction="column" spacing={3}>
        <Stack direction="row" justifyContent="space-between">
          <Stack direction="column">
            <Typography variant="subtitle2">Autoplay</Typography>
            <Typography variant="caption">
              Start video automatically when card appears
            </Typography>
          </Stack>
          <Switch
            checked={selectedBlock?.autoplay ?? true}
            name="autoplay"
            onChange={handleSwitchChange}
          />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Stack direction="column">
            <Typography variant="subtitle2">Muted</Typography>
            <Typography variant="caption">
              Video always muted on the first card
            </Typography>
          </Stack>
          <Switch
            checked={selectedBlock?.muted ?? parentOrder === 0}
            name="muted"
            onChange={handleSwitchChange}
          ></Switch>
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-around">
          <TimeField
            showSeconds
            value={formik.values.startAt}
            style={{ width: 120 }}
            onChange={formik.handleChange}
            input={
              <TextField
                id="startAt"
                name="startAt"
                label="Starts At"
                value={formik.values.startAt}
                variant="filled"
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
            style={{ width: 120 }}
            input={
              <TextField
                id="endAt"
                name="endAt"
                label="Ends At"
                value={formik.values.endAt}
                variant="filled"
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
        <Stack direction="row" justifyContent="space-between">
          <Stack direction="column" justifyContent="center">
            <Typography variant="subtitle2">Cover Image</Typography>
            <Typography variant="caption">
              Appears while video is loading
            </Typography>
          </Stack>
          <Box
            width={95}
            height={62}
            sx={{ backgroundColor: 'rgba(0, 0, 0, 0.06)', py: 1 }}
            borderRadius={2}
          >
            <Stack direction="row" justifyContent="space-around">
              <div
                style={{
                  overflow: 'hidden',
                  borderRadius: 8,
                  height: 55,
                  width: 55
                }}
              >
                {posterBlock?.src != null && (
                  <Image
                    src={posterBlock.src}
                    alt={posterBlock.alt}
                    width={55}
                    height={55}
                  />
                )}
                {posterBlock?.src == null && (
                  <Box
                    borderRadius={2}
                    sx={{
                      width: 55,
                      height: 55,
                      verticalAlign: 'center'
                    }}
                    justifyContent="center"
                  >
                    <ImageIcon sx={{ marginTop: 4, marginLeft: 4 }} />
                  </Box>
                )}
              </div>
              <Stack
                direction="column"
                justifyContent="center"
                sx={{ paddingRight: 1 }}
              >
                <Create color="primary" />
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Box>
  )
}
