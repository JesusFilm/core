import { ThemeMode, ThemeName, getTheme } from '@core/shared/ui/themes'

import { ButtonColor } from '../../../../../../../../../../../__generated__/globalTypes'

/**
 * Converts a ButtonColor enum value to its corresponding hexadecimal color code
 * based on the provided theme name and mode
 *
 * @param cardThemeName - The theme name to use for color conversion
 * @param cardThemeMode - The theme mode (light/dark) to use for color conversion
 * @param enumColor - The ButtonColor enum value to convert to hex
 * @returns The hexadecimal color code as a string
 */
export function convertEnumToHex(
  cardThemeName: ThemeName,
  cardThemeMode: ThemeMode,
  enumColor: ButtonColor
): string {
  const theme = getTheme({
    themeName: cardThemeName ?? ThemeName.base,
    themeMode: cardThemeMode ?? ThemeMode.light
  })

  switch (enumColor) {
    case ButtonColor.primary:
      return theme.palette.primary.main
    case ButtonColor.secondary:
      return theme.palette.secondary.main
    case ButtonColor.error:
      return theme.palette.error.main
    default:
      return theme.palette.primary.main
  }
}
