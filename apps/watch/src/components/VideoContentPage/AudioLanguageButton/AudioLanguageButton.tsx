import { ReactElement, useState } from 'react'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'
import LanguageOutlined from '@mui/icons-material/LanguageOutlined'
import AddOutlined from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import LanguageRounded from '@mui/icons-material/LanguageRounded'
import { compact } from 'lodash'
import { useVideo } from '../../../libs/videoContext'
import { AudioLanguageDialog } from '../../AudioDialog'

interface AudioLanguageButtonProps {
  componentVariant: 'button' | 'icon'
}

export function AudioLanguageButton({
  componentVariant
}: AudioLanguageButtonProps): ReactElement {
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
      {componentVariant === 'button' ? (
        <Button
          size="small"
          onClick={() => setOpenAudioLanguage(true)}
          sx={{
            gap: 1,
            display: 'flex',
            alignItem: 'center',
            color: 'background.paper',
            '&:hover': {
              backgroundColor: 'transparent'
            }
          }}
        >
          <LanguageOutlined fontSize="small" />
          <Typography variant="subtitle1">{localName ?? nativeName}</Typography>
          <AddOutlined fontSize="small" />
          <Typography variant="subtitle1">
            {languages.length - 1} Languages
          </Typography>
          <KeyboardArrowDownOutlined fontSize="small" />
        </Button>
      ) : (
        <IconButton onClick={() => setOpenAudioLanguage(true)}>
          <LanguageRounded sx={{ color: '#ffffff' }} />
        </IconButton>
      )}
      <AudioLanguageDialog
        open={openAudioLanguage}
        onClose={() => setOpenAudioLanguage(false)}
      />
    </ThemeProvider>
  )
}
