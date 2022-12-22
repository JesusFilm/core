import { ReactElement, useState } from 'react'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'
import LanguageOutlined from '@mui/icons-material/LanguageOutlined'
import AddOutlined from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { compact } from 'lodash'
import Box from '@mui/material/Box'
import { useVideo } from '../../../libs/videoContext'
import { AudioLanguageDialog } from '../../AudioDialog'

export function AudioLanguageButton(): ReactElement {
  const { variant, variantLanguagesWithSlug } = useVideo()
  const [openAudioLanguage, setOpenAudioLanguage] = useState(false)

  const languages = compact(
    variantLanguagesWithSlug?.map(({ language }) => language)
  )

  const nativeName = variant?.language?.name.find(
    ({ primary }) => !primary
  )?.value
  const localName = variant?.language?.name.find(
    ({ primary }) => primary
  )?.value

  return (
    <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.light}>
      <>
        <Button
          size="small"
          onClick={() => setOpenAudioLanguage(true)}
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
              {languages.length - 1} Languages
            </Typography>
          </Box>
          <KeyboardArrowDownOutlined fontSize="small" />
        </Button>
        <AudioLanguageDialog
          open={openAudioLanguage}
          onClose={() => setOpenAudioLanguage(false)}
        />
      </>
    </ThemeProvider>
  )
}
