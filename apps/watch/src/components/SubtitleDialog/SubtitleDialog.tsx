import { ReactElement, SyntheticEvent, ComponentProps } from 'react'
import Typography from '@mui/material/Typography'
import { Dialog } from '@core/shared/ui/Dialog'
import Stack from '@mui/material/Stack'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

import { GetVideo_video } from '../../../__generated__/GetVideo'

interface SubtitleDialogProps
  extends Pick<ComponentProps<typeof Dialog>, 'open' | 'onClose'> {
  video: GetVideo_video
  updateSubtitle: ({
    label,
    id,
    url,
    language
  }: {
    label: string
    id: string
    url: string
    language: string
  }) => void
}

export function SubtitleDialog({
  video,
  updateSubtitle,
  ...dialogProps
}: SubtitleDialogProps): ReactElement {
  const handleChange = (
    e: SyntheticEvent,
    newValue: { label: string; id: string; url: string; language: string }
  ): void => {
    e.preventDefault()
    updateSubtitle(newValue)
  }

  const options =
    video?.variant?.subtitle?.map((subtitle) => ({
      label: subtitle.language.name.map((name) => name.value).join(', '),
      id: subtitle.language.id,
      url: subtitle.value,
      language: subtitle.language.bcp47
    })) ?? []

  const SubtitleLink = (): ReactElement => (
    <Stack direction="column" spacing={4} sx={{ height: '430px' }}>
      <Autocomplete
        id="combo-box-demo"
        open
        options={options}
        onChange={handleChange}
        sx={{ width: '100vw', maxWidth: '100%' }}
        renderInput={(params) => <TextField {...params} label="Language" />}
      />
    </Stack>
  )

  return (
    <Dialog
      {...dialogProps}
      dialogTitle={{
        title: 'Subtitle this video',
        closeButton: true
      }}
      divider
    >
      <>
        <Stack
          direction="row"
          spacing={4}
          alignItems="flex-start"
          sx={{ mb: 4 }}
        >
          <Stack sx={{ maxWidth: '100%' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {video.title[0].value}
            </Typography>
            <SubtitleLink />
          </Stack>
        </Stack>
      </>
    </Dialog>
  )
}
