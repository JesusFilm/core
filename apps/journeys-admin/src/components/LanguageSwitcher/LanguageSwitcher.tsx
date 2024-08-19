import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

interface LanguageSwitcherProps {
  open: boolean
  handleClose: () => void
}

interface Language {
  languageCode: string
  localName: string
  nativeName?: string
}

export function LanguageSwitcher({
  open,
  handleClose
}: LanguageSwitcherProps): ReactElement {
  const router = useRouter()
  const { t, i18n } = useTranslation('apps-journeys-admin')

  const [languages, setLanguages] = useState<Language[]>([])
  const [previousLanguageCode, setPreviousLanguageCode] = useState<string>()
  const [currentLanguageCode, setCurrentLanguageCode] = useState(
    i18n?.language ?? 'en'
  )

  function handleChange(languageCode: string): void {
    setPreviousLanguageCode(currentLanguageCode)
    setCurrentLanguageCode(languageCode)

    const cookieFingerprint = '00004'
    document.cookie = `NEXT_LOCALE=${cookieFingerprint}---${languageCode}; path=/`
    const path = router.asPath
    void router.push(path, path, { locale: languageCode })
  }

  function handleRevert(): void {
    if (previousLanguageCode == null) return

    handleChange(previousLanguageCode)
    setPreviousLanguageCode(undefined)
    handleClose()
  }

  useEffect(() => {
    const supportedLanguageCodes = (
      i18n.options as unknown as { locales: string[] }
    )?.locales

    if (supportedLanguageCodes == null) return
    const formattedLanguages = supportedLanguageCodes
      .filter((languageCode) => languageCode !== 'zh')
      .map((languageCode): Language => {
        const nativeName = new Intl.DisplayNames([currentLanguageCode], {
          type: 'language'
        }).of(languageCode)
        const localName = new Intl.DisplayNames([languageCode], {
          type: 'language'
        }).of(languageCode)

        return {
          languageCode,
          nativeName: nativeName === localName ? undefined : nativeName,
          localName: localName ?? ''
        }
      })
    setLanguages(formattedLanguages)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguageCode])

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        dialogTitle={{
          title: t('Change Language', {
            lng: previousLanguageCode
          }),
          closeButton: true
        }}
      >
        <FormControl fullWidth>
          <Select
            value={currentLanguageCode}
            IconComponent={ChevronDownIcon}
            disabled={languages.length === 0}
          >
            {languages.map(({ languageCode, nativeName, localName }, index) => (
              <MenuItem
                key={`language-option-${index}`}
                value={languageCode}
                onClick={() => handleChange(languageCode)}
              >
                <Stack>
                  <Typography>{localName ?? nativeName}</Typography>
                  {languageCode !== currentLanguageCode &&
                    localName != null &&
                    nativeName != null && (
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
          {previousLanguageCode != null && (
            <Alert
              severity="warning"
              action={
                <Button onClick={handleRevert} color="inherit" size="small">
                  {t('Revert', {
                    lng: previousLanguageCode
                  })}
                </Button>
              }
            >
              {t('Would you like to revert to previous language?', {
                lng: previousLanguageCode
              })}
            </Alert>
          )}
        </Stack>
      </Dialog>
    </>
  )
}
