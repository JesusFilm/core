import AddOutlined from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined'
import LanguageOutlined from '@mui/icons-material/LanguageOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { getCookie } from '../../../libs/cookieHandler'
import { LANGUAGE_MAPPINGS } from '../../../libs/localeMapping'
import { useVideo } from '../../../libs/videoContext'

const DynamicLanguageSwitchDialog = dynamic<{
  open: boolean
  handleClose: () => void
}>(
  async () =>
    await import(
      /* webpackChunkName: "LanguageSwitchDialog" */
      '../../LanguageSwitchDialogNew/LanguageSwitchDialog'
    ).then((mod) => mod.LanguageSwitchDialog)
)

interface AudioLanguageButtonProps {
  componentVariant: 'button' | 'icon'
}

export function AudioLanguageButton({
  componentVariant
}: AudioLanguageButtonProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const { variantLanguagesCount } = useVideo()
  const [openLanguageSwitchDialog, setOpenLanguageSwitchDialog] =
    useState(false)
  const [loadLanguageSwitchDialog, setLoadLanguageSwitchDialog] =
    useState(false)

  // Get current locale from cookie and match with localeMapping
  const currentLocale = getCookie('NEXT_LOCALE') || 'en'
  const languageMapping = LANGUAGE_MAPPINGS[currentLocale]

  const localName = languageMapping?.localName

  function handleClick(): void {
    setOpenLanguageSwitchDialog(true)
    setLoadLanguageSwitchDialog(true)
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
            px: 0,
            py: 1,
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
            {localName}
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
              {t('{{ languageCount }} Languages', {
                languageCount: variantLanguagesCount - 1
              })}
            </Typography>
          </Box>
          <KeyboardArrowDownOutlined fontSize="small" />
        </Button>
      ) : (
        <IconButton onClick={handleClick}>
          <LanguageOutlined sx={{ color: '#ffffff' }} />
        </IconButton>
      )}
      {loadLanguageSwitchDialog && (
        <DynamicLanguageSwitchDialog
          open={openLanguageSwitchDialog}
          handleClose={() => setOpenLanguageSwitchDialog(false)}
        />
      )}
    </ThemeProvider>
  )
}
