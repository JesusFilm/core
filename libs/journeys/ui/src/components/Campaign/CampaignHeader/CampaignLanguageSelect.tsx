import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useMemo } from 'react'

import { useCampaign } from '../CampaignProvider'
import type { CampaignPublic } from '../types'

type CampaignLanguage = CampaignPublic['languages'][number]

export function languageAutonym(language: CampaignLanguage): string {
  const names = language.language.name
  return (
    names.find((name) => name.primary)?.value ??
    names[0]?.value ??
    language.language.bcp47 ??
    language.languageId
  )
}

/**
 * The fixed language select: rendered only with two or more campaign
 * languages, labelled by autonym, ordered by `CampaignLanguage.order`, the
 * Page Language selected. Choosing one reloads the page with the `lang`
 * param, the binding point the languages ticket wires to the cookie.
 */
export function CampaignLanguageSelect(): ReactElement | null {
  const { t } = useTranslation('libs-journeys-ui')
  const { campaign } = useCampaign()
  const languages = useMemo(
    () => [...campaign.languages].sort((a, b) => a.order - b.order),
    [campaign.languages]
  )
  if (languages.length < 2) return null

  function handleChange(event: SelectChangeEvent<string>): void {
    const selected = languages.find(
      (language) => language.languageId === event.target.value
    )
    const bcp47 = selected?.language.bcp47
    if (bcp47 == null) return
    const [pathname] = window.location.href.split(/[?#]/)
    window.location.assign(`${pathname}?lang=${encodeURIComponent(bcp47)}`)
  }

  return (
    <Select
      size="small"
      value={campaign.languageId}
      onChange={handleChange}
      inputProps={{ 'aria-label': t('Language') }}
      data-testid="CampaignLanguageSelect"
      sx={{
        color: 'var(--campaign-band-text)',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--campaign-band-border)'
        },
        '& .MuiSelect-icon': { color: 'var(--campaign-band-accent)' }
      }}
    >
      {languages.map((language) => (
        <MenuItem key={language.id} value={language.languageId}>
          {languageAutonym(language)}
        </MenuItem>
      ))}
    </Select>
  )
}
