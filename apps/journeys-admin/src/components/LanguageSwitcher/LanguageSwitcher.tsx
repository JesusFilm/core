import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@core/shared/ui/Dialog'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

interface LanguageSwitcherProps {
  open: boolean
  handleClose: () => void
}

interface LanguageOption {
  localeCode: string
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
  const [previousLanguageId, setPreviousLanguageId] = useState<string>()

  const currentLanguage = i18n?.language ?? 'en'

  const getCurrentLanguage = useCallback(
    (localeCode: string): LanguageOption => {
      const nativeName = new Intl.DisplayNames([currentLanguage], {
        type: 'language'
      }).of(localeCode)
      const localName = new Intl.DisplayNames([localeCode], {
        type: 'language'
      }).of(localeCode)

      return {
        localeCode,
        nativeName: nativeName === localName ? undefined : nativeName,
        localName
      }
    },
    [currentLanguage]
  )

  const handleLocaleSwitch = useCallback(
    (localeCode: string | undefined) => {
      if (currentLanguage != null) setPreviousLanguageId(currentLanguage)

      const cookieFingerprint = '00001'
      document.cookie = `NEXT_LOCALE=${cookieFingerprint}-${localeCode}; path=/`
      const path = router.asPath
      void router.push(path, path, { locale: localeCode })
    },
    [router, currentLanguage]
  )

  function handleCancelLanguageChange(): void {
    handleLocaleSwitch(previousLanguageId)
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
            lng: previousLanguageId
          }),
          closeButton: true
        }}
      >
        <FormControl fullWidth>
          <Select
            value={currentLanguage}
            IconComponent={ChevronDownIcon}
            disabled={languages.length === 0}
          >
            {languages.map(({ localeCode, nativeName, localName }, index) => (
              <MenuItem
                key={`language-option-${index}`}
                value={localeCode}
                onClick={() => handleLocaleSwitch(localeCode)}
              >
                <Stack>
                  <Typography>{localName ?? nativeName}</Typography>
                  {localName != null && nativeName != null && (
                    <Typography variant="body2" color="text.secondary">
                      {nativeName}
                    </Typography>
                  )}
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Stack gap={2} sx={{ pt: 2 }}>
          {previousLanguageId != null && (
            <Alert
              severity="warning"
              action={
                <Button
                  onClick={handleCancelLanguageChange}
                  color="inherit"
                  size="small"
                >
                  {t('Revert', {
                    lng: previousLanguageId
                  })}
                </Button>
              }
            >
              {t('Are you sure you want to change language?', {
                lng: previousLanguageId
              })}
            </Alert>
          )}
        </Stack>
      </Dialog>
    </>
  )
}
