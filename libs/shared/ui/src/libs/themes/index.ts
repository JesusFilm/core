import { Theme } from '@mui/material/styles'

import { getBaseDark, getBaseLight } from './base/theme'
import { adminLight } from './journeysAdmin/theme'
import { getJourneyUiDark, getJourneyUiLight } from './journeyUi/theme'
import { websiteDark, websiteLight } from './website/theme'

export enum ThemeMode {
  dark = 'dark',
  light = 'light'
}

export enum ThemeName {
  base = 'base',
  website = 'website',
  journeyUi = 'journeyUi',
  journeysAdmin = 'journeysAdmin'
}

interface ThemeProps {
  themeName: ThemeName
  themeMode: ThemeMode
  rtl?: boolean
  locale?: string
}

export const getTheme = ({
  themeName,
  themeMode,
  rtl = false,
  locale = ''
}: ThemeProps): Theme => {
  const themes = {
    base: { light: getBaseLight(rtl, locale), dark: getBaseDark(rtl, locale) },
    journeyUi: {
      light: getJourneyUiLight(rtl, locale),
      dark: getJourneyUiDark(rtl, locale)
    },
    website: { light: websiteLight, dark: websiteDark }
  }

  if (themeName === ThemeName.journeysAdmin) {
    if (themeMode === ThemeMode.dark)
      console.warn('Journeys Admin has no dark theme! Using light theme.')
    return adminLight
  } else {
    return {
      ...themes[themeName][themeMode]
    }
  }
}
