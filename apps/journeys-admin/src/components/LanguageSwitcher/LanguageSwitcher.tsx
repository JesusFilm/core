import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@core/shared/ui/Dialog'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

interface languageState {
  confirmLanguageChange: boolean
  prevLanguageId?: string
}

interface LanguageSwitcherProps {
  open: boolean
  handleClose: () => void
}

interface LanguageOption {
  id: string
  localName?: string
  nativeName?: string
}

export function LanguageSwitcher({
  open,
  handleClose
}: LanguageSwitcherProps): ReactElement {
  const router = useRouter()
  const { t, i18n } = useTranslation('apps-journeys-admin')

  const [languages, setLanguages] = useState<LanguageOption[]>([])
  const [languageState, setLanguageState] = useState<languageState>({
    confirmLanguageChange: false,
    prevLanguageId: undefined
  })

  const currentLocale = i18n?.language ?? 'en'

  const getCurrentLanguage = useMemo(
    () =>
      (language: string): LanguageOption => {
        const nativeName = new Intl.DisplayNames([currentLocale], {
          type: 'language'
        }).of(language)
        const localName = new Intl.DisplayNames([language], {
          type: 'language'
        }).of(language)

        return {
          id: language,
          nativeName: nativeName === localName ? undefined : nativeName,
          localName
        }
      },
    [currentLocale]
  )
  const currentLanguage = getCurrentLanguage(currentLocale)

  const handleLocaleSwitch = useCallback(
    (localeCode: string | undefined) => {
      if (currentLanguage != null)
        setLanguageState({
          confirmLanguageChange: true,
          prevLanguageId: currentLanguage.id
        })

      const cookieFingerprint = '00001'
      document.cookie = `NEXT_LOCALE=${cookieFingerprint}-${localeCode}; path=/`
      const path = router.asPath
      void router.push(path, path, { locale: localeCode })
    },
    [router, currentLanguage]
  )

  function handleCancelLanguageChange(): void {
    const { prevLanguageId } = languageState
    handleLocaleSwitch(prevLanguageId)
    handleClose()
  }

  useEffect(() => {
    const supportedLanguages = (
      i18n.options as unknown as { locales: string[] }
    )?.locales

    if (supportedLanguages == null) return
    const formattedLanguages = supportedLanguages.map(getCurrentLanguage)
    setLanguages(formattedLanguages)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        dialogTitle={{
          title: t('Change Language', {
            lng: languageState.prevLanguageId
          }),
          closeButton: true
        }}
      >
        <FormControl fullWidth>
          <Select
            value={currentLanguage.localName}
            IconComponent={ChevronDownIcon}
            disabled={languages.length === 0}
          >
            {languages.map((language, index) => (
              <MenuItem
                key={`language-option-${index}`}
                value={language.localName}
                onClick={() => handleLocaleSwitch(language.id)}
              >
                <Stack>
                  <Typography>
                    {language.localName ?? language.nativeName}
                  </Typography>
                  {language.localName != null &&
                    language.nativeName != null && (
                      <Typography variant="body2" color="text.secondary">
                        {language.nativeName}
                      </Typography>
                    )}
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Stack gap={2} sx={{ pt: 2 }}>
          {languageState.confirmLanguageChange && (
            <Alert
              severity="warning"
              action={
                <Button
                  onClick={handleCancelLanguageChange}
                  color="inherit"
                  size="small"
                >
                  {t('Revert', {
                    lng: languageState.prevLanguageId
                  })}
                </Button>
              }
            >
              {t('Are you sure you want to change language?', {
                lng: languageState.prevLanguageId
              })}
            </Alert>
          )}
        </Stack>
      </Dialog>
    </>
  )
}
