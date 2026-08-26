import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useState } from 'react'

import Edit2Icon from '@core/shared/ui/icons/Edit2'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../__generated__/BlockFields'
import { ImageBlockThumbnail } from '../../../ImageBlockThumbnail'

const VideoBlockEditorSettingsPosterLibrary = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/VideoBlockEditor/Settings/Poster/Library/VideoBlockEditorSettingsPosterLibrary" */ './Library'
    ).then((mod) => mod.VideoBlockEditorSettingsPosterLibrary)
)

interface BackgroundMediaCoverImageProps {
  selectedBlock: ImageBlock | null
  parentBlockId: string | undefined
  disabled?: boolean
}

export function VideoBlockEditorSettingsPoster({
  selectedBlock,
  parentBlockId,
  disabled = false
}: BackgroundMediaCoverImageProps): ReactElement {
  const theme = useTheme()
  const [open, setOpen] = useState<boolean | undefined>()
  const handleOpen = (): void => setOpen(true)
  const handleClose = (): void => setOpen(false)

  const [loading, setLoading] = useState(false)
  const handleLoading = (): void => setLoading(true)
  const handleLoad = (): void => setLoading(false)
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Stack
      direction="row"
      spacing={3}
      data-testid="VideoBlockEditorSettingsPoster"
      sx={{
        justifyContent: 'space-between'
      }}
    >
      <Stack
        direction="column"
        sx={{
          justifyContent: 'center'
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            color: disabled ? theme.palette.action.disabled : '',
            letterSpacing: 0
          }}
        >
          {t('Cover Image')}
        </Typography>
        <Typography
          sx={{ color: disabled ? theme.palette.action.disabled : '' }}
          variant="caption"
        >
          {t('Appears while video is loading')}
        </Typography>
      </Stack>
      <Box
        sx={{
          height: 62,
          borderRadius: 2,
          backgroundColor: 'rgba(0, 0, 0, 0.06)',
          p: 1
        }}
      >
        <Stack
          direction="row"
          sx={{
            justifyContent: 'space-around'
          }}
        >
          <ImageBlockThumbnail
            selectedBlock={selectedBlock}
            loading={loading}
          />
          <Stack
            direction="column"
            sx={{
              justifyContent: 'center',
              paddingRight: 1
            }}
          >
            <IconButton
              onClick={handleOpen}
              disabled={disabled}
              data-testid="posterCreateButton"
            >
              <Edit2Icon
                sx={{
                  color: disabled
                    ? theme.palette.action.disabled
                    : theme.palette.primary.main
                }}
              />
            </IconButton>
            {open != null && (
              <VideoBlockEditorSettingsPosterLibrary
                selectedBlock={selectedBlock}
                parentBlockId={parentBlockId}
                onClose={handleClose}
                open={open}
                onLoading={handleLoading}
                onLoad={handleLoad}
              />
            )}
          </Stack>
        </Stack>
      </Box>
    </Stack>
  )
}
