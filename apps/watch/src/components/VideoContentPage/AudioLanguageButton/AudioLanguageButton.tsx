import AddOutlined from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined'
import LanguageOutlined from '@mui/icons-material/LanguageOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { ReactElement, useState } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { useVideo } from '../../../libs/videoContext'

const DynamicAudioLanguageDialog = dynamic<{
  open: boolean
  onClose: () => void
}>(
  async () =>
    await import(
      /* webpackChunkName: "AudioLanguageDialog" */
      '../../AudioLanguageDialog'
    ).then((mod) => mod.AudioLanguageDialog)
)

interface AudioLanguageButtonProps {
  componentVariant: 'button' | 'icon'
}

export function AudioLanguageButton({
  componentVariant
}: AudioLanguageButtonProps): ReactElement {
  const { variant, variantLanguagesCount } = useVideo()
  const [openAudioLanguageDialog, setOpenAudioLanguageDialog] = useState(false)
  const [loadAudioLanguageDialog, setLoadAudioLanguageDialog] = useState(false)

  const nativeName = variant?.language?.name.find(
    ({ primary }) => !primary
  )?.value
  const localName = variant?.language?.name.find(
    ({ primary }) => primary
  )?.value

  function handleClick(): void {
    setOpenAudioLanguageDialog(true)
    setLoadAudioLanguageDialog(true)
  }

  return (
    <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.light}>
      {componentVariant === 'button' ? (
        <Button
          data-testid="AudioLanguageButton"
          size="small"
          onClick={handleClick}
          sx={{
            gap: 1,
            display: 'flex',
            alignItem: 'center',
            justifyContent: 'flex-end',
            width: 'inherit',
            color: 'background.paper',
            '&:hover': {
              backgroundColor: 'transparent'
            }
          }}
        >
          <LanguageOutlined fontSize="small" />
          <Typography
            variant="subtitle1"
            sx={{
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}
          >
            {localName ?? nativeName}
          </Typography>
          <Box
            sx={{
              display: { xs: 'none', lg: 'flex' },
              alignItems: 'center',
              gap: 1
            }}
          >
            <AddOutlined fontSize="small" />
            <Typography variant="subtitle1" sx={{ whiteSpace: 'nowrap' }}>
              {variantLanguagesCount - 1} Languages
            </Typography>
          </Box>
          <KeyboardArrowDownOutlined fontSize="small" />
        </Button>
      ) : (
        <IconButton onClick={handleClick}>
          <LanguageOutlined sx={{ color: '#ffffff' }} />
        </IconButton>
      )}
      {loadAudioLanguageDialog && (
        <DynamicAudioLanguageDialog
          open={openAudioLanguageDialog}
          onClose={() => setOpenAudioLanguageDialog(false)}
        />
      )}
    </ThemeProvider>
  )
}
