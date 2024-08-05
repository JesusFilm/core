import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { FormikValues, useFormik } from 'formik'
import noop from 'lodash/noop'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import TimeField from 'react-simple-timefield'

import type { TreeBlock } from '@core/journeys/ui/block'
import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'
import Play2Icon from '@core/shared/ui/icons/Play2'
import StopCircleContainedIcon from '@core/shared/ui/icons/StopCircleContained'
import {
  secondsToTimeFormat,
  timeFormatToSeconds
} from '@core/shared/ui/timeFormat'

import {
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../__generated__/BlockFields'
import {
  VideoBlockObjectFit as ObjectFit,
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../../../../__generated__/globalTypes'

import { VideoBlockEditorSettingsPoster } from './Poster/VideoBlockEditorSettingsPoster'

interface Values extends FormikValues {
  autoplay: boolean
  muted: boolean
  startAt: string
  endAt: string
  objectFit: ObjectFit
}

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
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const initialValues: Values = {
    autoplay: selectedBlock?.autoplay ?? true,
    muted: selectedBlock?.muted ?? true,
    startAt: secondsToTimeFormat(selectedBlock?.startAt ?? 0),
    endAt: secondsToTimeFormat(selectedBlock?.endAt ?? 0),
    objectFit: selectedBlock?.objectFit ?? ObjectFit.fill
  }
  const { values, errors, handleChange, setFieldValue } = useFormik<Values>({
    initialValues,
    enableReinitialize: true,
    validate: async (values) => {
      const convertedStartAt = timeFormatToSeconds(values.startAt)
      const convertedEndAt = timeFormatToSeconds(values.endAt)
      if (convertedStartAt > convertedEndAt - 3) {
        const message = t(
          'Start time has to be at least 3 seconds less than end time'
        )
        errors.startAt = message
        enqueueSnackbar(message, {
          variant: 'error',
          preventDuplicate: true
        })
      } else if (
        selectedBlock?.duration != null &&
        convertedStartAt > selectedBlock?.duration - 3
      ) {
        const message = t(
          'Start time has to be at least 3 seconds less than video duration {{ time }}',
          { time: secondsToTimeFormat(selectedBlock?.duration) }
        )
        errors.startAt = message
        enqueueSnackbar(message, {
          variant: 'error',
          preventDuplicate: true
        })
      } else if (
        selectedBlock?.duration != null &&
        convertedEndAt > selectedBlock?.duration
      ) {
        const message = t(
          'End time has to be no more than video duration {{ time }}',
          { time: secondsToTimeFormat(selectedBlock?.duration) }
        )
        errors.endAt = message
        enqueueSnackbar(message, {
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
    <Box sx={{ px: 4, width: '100%' }} data-testid="VideoBlockEditorSettings">
      <Stack direction="column" spacing={6}>
        <Stack direction="column" spacing={2}>
          <Typography
            variant="subtitle2"
            sx={{
              color: selectedBlock == null ? 'action.disabled' : undefined
            }}
          >
            {t('Timing')}
          </Typography>
          <Stack direction="row" justifyContent="space-around" spacing={3}>
            <TimeField
              showSeconds
              value={values.startAt}
              onChange={handleChange}
              style={{ width: '100%' }}
              input={
                <TextField
                  label={t('Starts At')}
                  name="startAt"
                  value={values.startAt}
                  variant="filled"
                  disabled={selectedBlock == null}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Play2Icon />
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
                  label={t('Ends At')}
                  name="endAt"
                  value={values.endAt}
                  variant="filled"
                  disabled={selectedBlock == null}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <StopCircleContainedIcon />
                      </InputAdornment>
                    )
                  }}
                />
              }
            />
          </Stack>
        </Stack>
        <Stack direction="column" spacing={2}>
          <Stack>
            <Typography
              variant="subtitle2"
              sx={{
                color:
                  selectedBlock?.source === VideoBlockSource.youTube
                    ? 'action.disabled'
                    : undefined
              }}
            >
              {t('Aspect ratio')}
            </Typography>
            {selectedBlock?.source === VideoBlockSource.youTube && (
              <Typography variant="caption" color="action.disabled">
                {t('This option is not available for YouTube videos')}
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
              {t('Fill')}
            </ToggleButton>
            <ToggleButton
              sx={{
                '&.Mui-selected': {
                  color: 'primary.main'
                }
              }}
              value={ObjectFit.fit}
            >
              {t('Fit')}
            </ToggleButton>
            <ToggleButton
              sx={{
                '&.Mui-selected': {
                  color: 'primary.main'
                }
              }}
              value={ObjectFit.zoomed}
            >
              {t('Crop')}
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <Stack direction="column" spacing={4}>
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
                {t('Autoplay')}
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
                {t('Start video automatically when card appears')}
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
                {t('Muted')}
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
                {t('Video always muted on the first card')}
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
          {values.autoplay && !values.muted && (
            <Stack direction="row" alignItems="center" color="text.secondary">
              <InformationCircleContainedIcon sx={{ mr: 4 }} />
              <Typography variant="caption">
                {t(
                  'Some mobile browsers may override this choice and default the video to play muted when autoplay is enabled'
                )}
              </Typography>
            </Stack>
          )}
          <Divider />
          <VideoBlockEditorSettingsPoster
            selectedBlock={posterBlock}
            parentBlockId={selectedBlock?.id}
            disabled={selectedBlock == null}
          />
        </Stack>
      </Stack>
    </Box>
  )
}
