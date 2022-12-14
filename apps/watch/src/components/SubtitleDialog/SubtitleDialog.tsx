import {
  ReactElement,
  SyntheticEvent,
  ComponentProps,
  MutableRefObject
} from 'react'
import { Dialog } from '@core/shared/ui/Dialog'
import Stack from '@mui/material/Stack'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
// import videojs from 'video.js'
import { VideoJsPlayer } from 'video.js'
import { useVideo } from '../../libs/videoContext'

interface SubtitleDialogProps
  extends Pick<ComponentProps<typeof Dialog>, 'open' | 'onClose'> {
  playerRef: MutableRefObject<VideoJsPlayer | undefined>
}

export function SubtitleDialog({
  open,
  onClose,
  playerRef
}: SubtitleDialogProps): ReactElement {
  const { variant } = useVideo()

  console.log(variant)

  const handleChange = (
    e: SyntheticEvent,
    newValue: { label: string; id: string; url: string; language: string }
  ): void => {
    e.preventDefault()
    updateSubtitle(newValue, playerRef)
  }

  function updateSubtitle({ label, id, url, language }, playerRef): void {
    playerRef?.current?.addRemoteTextTrack(
      {
        id: id,
        src: url,
        kind: 'subtitles',
        language: language,
        label: label,
        mode: 'showing',
        default: true
      },
      true
    )

    const tracks = playerRef?.current?.textTracks() ?? []

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i]

      if (track.id === id) {
        track.mode = 'showing'
      } else {
        track.mode = 'disabled'
      }
    }
  }

  const options =
    variant?.subtitle?.map((subtitle) => ({
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
      open={open}
      onClose={onClose}
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
            <SubtitleLink />
          </Stack>
        </Stack>
      </>
    </Dialog>
  )
}
