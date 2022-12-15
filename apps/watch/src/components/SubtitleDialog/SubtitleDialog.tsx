import { ReactElement, ComponentProps, MutableRefObject, useState } from 'react'
import { Dialog } from '@core/shared/ui/Dialog'
import TextField from '@mui/material/TextField'
import SubtitlesOutlined from '@mui/icons-material/SubtitlesOutlined'
import {
  Language,
  LanguageAutocomplete
} from '@core/shared/ui/LanguageAutocomplete'
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
  const languages = variant?.subtitle?.map(
    ({ language }) => language
  ) as unknown as Language[]

  const [selected, setSelected] = useState<Language | undefined>(languages[0])

  const tracks = playerRef?.current?.textTracks() ?? []
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i]
    if (track.mode === 'showing') {
      const selectedLanguage = languages.find(
        (language) => language.id === track.id
      )
      setSelected(selectedLanguage)
    }
  }

  const handleChange = ({ id }): void => {
    updateSubtitle(id)
  }

  function updateSubtitle(id): void {
    const selected = variant?.subtitle?.find(
      (subtitle) => subtitle.language.id === id
    )

    playerRef?.current?.addRemoteTextTrack(
      {
        id: id,
        src: selected?.value,
        kind: 'subtitles',
        language: selected?.language.bcp47 == null && undefined,
        label: selected?.language.name.map((name) => name.value).join(', '),
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

    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dialogTitle={{
        icon: <SubtitlesOutlined sx={{ mr: 3 }} />,
        title: 'Subtitles'
      }}
      divider
    >
      <LanguageAutocomplete
        onChange={handleChange}
        value={selected}
        languages={languages}
        loading={false}
        renderInput={(params) => (
          <TextField
            {...params}
            hiddenLabel
            placeholder="Search Language"
            label="Language"
            helperText={`${languages?.length ?? 0} Languages Available`}
            sx={{
              '> .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        )}
      />
    </Dialog>
  )
}
