import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useRef } from 'react'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../__generated__/BlockFields'
import { ImageBlockUpdateInput } from '../../../../../__generated__/globalTypes'
import { ImageBlockEditor } from '../../../Editor/Slider/Settings/Drawer/ImageBlockEditor'

interface CreatorImagePickerDrawerProps {
  open: boolean
  src: string
  alt: string
  onClose: () => void
  onChange: (src: string, alt: string) => void | Promise<void>
}

/**
 * Right-anchored drawer (bottom sheet on mobile) that wraps the editor's
 * ImageBlockEditor for creator-image selection. Coalesces rapid double
 * fires of `onChange` so a fast click-then-click only writes the latest
 * pick once. The drawer renders above the parent CollectionDialog modal
 * via z-index bump.
 */
export function CreatorImagePickerDrawer({
  open,
  src,
  alt,
  onClose,
  onChange
}: CreatorImagePickerDrawerProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))
  const writeInFlightRef = useRef(false)

  async function handleSet(nextSrc: string, nextAlt: string): Promise<void> {
    if (writeInFlightRef.current) return
    writeInFlightRef.current = true
    try {
      await onChange(nextSrc, nextAlt)
    } finally {
      writeInFlightRef.current = false
    }
  }

  return (
    <Drawer
      anchor={mdUp ? 'right' : 'bottom'}
      open={open}
      onClose={onClose}
      data-testid="CollectionCreatorImagePicker"
      // Render above the parent CollectionDialog (modal z-index 1300).
      sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
      PaperProps={{
        sx: {
          // Match the editor's settings drawer dimensions and chrome.
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          width: { xs: 'auto', md: 328 },
          left: { xs: 0, md: 'auto' },
          top: { xs: 0, md: 32 },
          right: { xs: 0, md: 32 },
          bottom: 0,
          height: 'calc(100% - 20px)',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {t('Choose creator image')}
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label={t('Close')}>
          <CloseRoundedIcon />
        </IconButton>
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <ImageBlockEditor
          selectedBlock={src !== '' ? buildSyntheticImageBlock(src, alt) : null}
          onChange={async (input: ImageBlockUpdateInput) => {
            if (input.src == null || input.src === '') return
            await handleSet(input.src, input.alt ?? '')
          }}
          onDelete={async () => {
            await handleSet('', '')
          }}
          showAdd
        />
      </Box>
    </Drawer>
  )
}

// Synthetic ImageBlock so we can hand the existing ImageBlockEditor a value
// for its `selectedBlock` prop. The editor only reads `src` / `alt`; the
// other fields are required by the type but unused here.
function buildSyntheticImageBlock(src: string, alt: string): ImageBlock {
  return {
    __typename: 'ImageBlock',
    id: 'collection-creator-image',
    parentBlockId: null,
    parentOrder: null,
    src,
    alt,
    width: 0,
    height: 0,
    blurhash: '',
    scale: null,
    focalTop: null,
    focalLeft: null,
    customizable: null
  }
}
