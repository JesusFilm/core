import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Header1Icon from '@core/shared/ui/icons/Header1'
import Type2Icon from '@core/shared/ui/icons/Type2'
import Type3Icon from '@core/shared/ui/icons/Type3'

import { FontSelect } from './FontSelect'

export enum FontFamily {
  Montserrat = 'Montserrat',
  Inter = 'Inter',
  Oswald = 'Oswald',
  PlayfairDisplay = 'Playfair Display',
  Georgia = 'Georgia',
  CormorantGaramond = 'Cormorant Garamond',
  NotoSans = 'Noto Sans',
  BerkshireSwash = 'Berkshire Swash',
  Cinzel = 'Cinzel',
  Baloo = 'Baloo 2',
  Nunito = 'Nunito',
  Raleway = 'Raleway'
}

interface ThemeSettingsProps {
  onHeaderFontChange: (font: string) => void
  onBodyFontChange: (font: string) => void
  onLabelsFontChange: (font: string) => void
  headerFont: string
  bodyFont: string
  labelsFont: string
}

export function ThemeSettings({
  onHeaderFontChange,
  onBodyFontChange,
  onLabelsFontChange,
  headerFont,
  bodyFont,
  labelsFont
}: ThemeSettingsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const headerFontOptions = [
    FontFamily.Montserrat,
    FontFamily.Inter,
    FontFamily.Oswald,
    FontFamily.PlayfairDisplay,
    FontFamily.Georgia,
    FontFamily.CormorantGaramond,
    FontFamily.NotoSans,
    FontFamily.BerkshireSwash,
    FontFamily.Cinzel,
    FontFamily.Baloo
  ]

  const bodyFontOptions = [
    FontFamily.Montserrat,
    FontFamily.Inter,
    FontFamily.Nunito,
    FontFamily.Raleway,
    FontFamily.NotoSans,
    FontFamily.Georgia,
    FontFamily.CormorantGaramond
  ]

  const labelsFontOptions = [
    FontFamily.Montserrat,
    FontFamily.Inter,
    FontFamily.NotoSans,
    FontFamily.Nunito,
    FontFamily.Raleway,
    FontFamily.Georgia,
    FontFamily.Baloo
  ]

  return (
    <Stack spacing={4} sx={{ width: '100%' }}>
      <FontSelect
        label={t('Header Text')}
        value={headerFont}
        options={headerFontOptions.sort()}
        onChange={onHeaderFontChange}
        icon={<Header1Icon />}
        labelId="header-font-select-label"
        selectId="header-font-select"
        helperText={t('Used for large text elements like titles and headings.')}
      />
      <FontSelect
        label={t('Body Text')}
        value={bodyFont}
        options={bodyFontOptions.sort()}
        onChange={onBodyFontChange}
        icon={<Type2Icon />}
        labelId="body-font-select-label"
        selectId="body-font-select"
        helperText={t('Used for paragraphs, subheadings, and smaller content.')}
      />
      <FontSelect
        label={t('Label Text')}
        value={labelsFont}
        options={labelsFontOptions.sort()}
        onChange={onLabelsFontChange}
        icon={<Type3Icon />}
        labelId="labels-font-select-label"
        selectId="labels-font-select"
        helperText={t('Used for buttons, forms, and interface elements.')}
      />
    </Stack>
  )
}
