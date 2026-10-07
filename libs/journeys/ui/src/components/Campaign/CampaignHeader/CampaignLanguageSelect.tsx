import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useMemo } from 'react'

import { useCampaign } from '../CampaignProvider'
import {
  CAMPAIGN_LANGUAGE_COOKIE,
  CAMPAIGN_LANGUAGE_PARAM
} from '../libs/resolvePageLanguage'
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

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

/** Remember the chosen Page Language for a year, site-wide, so the next visit without a `lang` param opens in it. */
export function writeCampaignLanguageCookie(bcp47: string): void {
  document.cookie = `${CAMPAIGN_LANGUAGE_COOKIE}=${encodeURIComponent(bcp47)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
}

/** The current page with the `lang` param set to `bcp47`, other params and the hash kept. */
export function campaignLanguageUrl(href: string, bcp47: string): string {
  const url = new URL(href)
  url.searchParams.set(CAMPAIGN_LANGUAGE_PARAM, bcp47)
  return url.toString()
}

/**
 * The fixed language select: rendered only with two or more campaign
 * languages, labelled by autonym, ordered by `CampaignLanguage.order`, the
 * Page Language selected. Choosing one writes the language cookie and
 * reloads the page with the `lang` param, so the choice is sticky across
 * region switches and shared links open in the sender's language.
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
    writeCampaignLanguageCookie(bcp47)
    window.location.assign(campaignLanguageUrl(window.location.href, bcp47))
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
