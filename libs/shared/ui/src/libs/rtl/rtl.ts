export function isRtl(locale: string): boolean {
  // locale should be bcp47, else iso3
  const formattedLocale = locale.split('-')[0].toLowerCase()

  switch (formattedLocale) {
    case 'ar':
    case 'arc':
    case 'dv':
    case 'fa':
    case 'ha':
    case 'he':
    case 'khw':
    case 'ks':
    case 'ku':
    case 'ps':
    case 'ur':
    case 'yi':
      return true
    default:
      return false
  }
}
