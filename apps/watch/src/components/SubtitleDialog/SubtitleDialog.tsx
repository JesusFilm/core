import { ReactElement, ComponentProps, useState } from 'react'
import { Dialog } from '@core/shared/ui/Dialog'
import TextField from '@mui/material/TextField'
import SubtitlesOutlined from '@mui/icons-material/SubtitlesOutlined'
import {
  Language,
  LanguageAutocomplete
} from '@core/shared/ui/LanguageAutocomplete'
import { VideoJsPlayer } from 'video.js'
import { VideoContentFields_variant_subtitle } from '../../../__generated__/VideoContentFields'

interface SubtitleDialogProps
  extends Pick<ComponentProps<typeof Dialog>, 'open' | 'onClose'> {
  player: VideoJsPlayer
  subtitles: VideoContentFields_variant_subtitle[] | undefined
}

export function SubtitleDialog({
  open,
  onClose,
  player,
  subtitles
}: SubtitleDialogProps): ReactElement {
  const [selected, setSelected] = useState<Language | undefined>(undefined)

  const languages = subtitles?.map(
    ({ language }) => language
  ) as unknown as Language[]

  const handleChange = (result): void => {
    setSelected(result)
    updateSubtitle(result.id)
  }

  function updateSubtitle(id): void {
    const selected = subtitles?.find((subtitle) => subtitle.language.id === id)

    player.addRemoteTextTrack(
      {
        id: id,
        src: selected?.value,
        kind: 'subtitles',
        language:
          selected?.language.bcp47 === null
            ? undefined
            : selected?.language.bcp47,
        label: selected?.language.name.map((name) => name.value).join(', '),
        mode: 'showing',
        default: true
      },
      true
    )
    const tracks = player.textTracks() ?? []

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
        title: 'Subtitles',
        closeButton: true
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
