import { useQuery } from '@apollo/client'
import SubtitlesOutlined from '@mui/icons-material/SubtitlesOutlined'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import { ComponentProps, ReactElement, memo, useState } from 'react'
import Player from 'video.js/dist/types/player'

import { Dialog } from '@core/shared/ui/Dialog'
import {
  Language,
  LanguageAutocomplete
} from '@core/shared/ui/LanguageAutocomplete'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { GetSubtitles } from '../../../__generated__/GetSubtitles'
import { useVideo } from '../../libs/videoContext'
import { GET_SUBTITLES } from '../../libs/watchContext/useSubtitleUpdate/useSubtitleUpdate'

export interface SubtitleDialogProps
  extends Pick<ComponentProps<typeof Dialog>, 'open' | 'onClose'> {
  player: Player & { textTracks?: () => TextTrackList }
}

export const SubtitleDialog = memo(function SubtitleDialog({
  open,
  onClose,
  player
}: SubtitleDialogProps): ReactElement {
  const { variant } = useVideo()
  const [selected, setSelected] = useState<Language | undefined>(undefined)

  const { loading, data } = useQuery<GetSubtitles>(GET_SUBTITLES, {
    variables: {
      id: variant?.slug
    }
  })

  const languages = data?.video?.variant?.subtitle?.map(
    ({ language }) => language
  ) as unknown as Language[]

  function handleChange(result?: Language): void {
    setSelected(result)
    updateSubtitle(result?.id)
  }

  function updateSubtitle(id: string | undefined): void {
    const selected = data?.video?.variant?.subtitle?.find(
      (subtitle) => subtitle.language.id === id
    )

    player.addRemoteTextTrack(
      {
        id,
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
    const tracks = player.textTracks?.() ?? []

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i]
      if (track.id === id) {
        track.mode = 'showing'
      } else {
        track.mode = 'disabled'
      }
    }

    onClose?.()
  }

  return (
    <ThemeProvider
      themeName={ThemeName.website}
      themeMode={ThemeMode.light}
      nested
    >
      <Dialog
        open={open}
        onClose={onClose}
        dialogTitle={{
          icon: <SubtitlesOutlined sx={{ mr: 3 }} />,
          title: 'Subtitles',
          closeButton: true
        }}
        divider
        testId="SubtitleDialog"
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
              helperText={`${variant?.subtitleCount ?? 0} Languages Available`}
              sx={{
                '> .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
        />
      </Dialog>
    </ThemeProvider>
  )
})
