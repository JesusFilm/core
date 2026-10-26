const WATCH_ORIGIN = 'https://www.jesusfilm.org/watch'

/**
 * The Watch page for a Video: a variant slug `<videoSlug>/<languageSlug>`
 * becomes `https://www.jesusfilm.org/watch/<videoSlug>.html/<languageSlug>.html`;
 * a bare video slug links to the Video in Watch's default language.
 */
export function watchUrl(slug: string): string {
  const parts = slug
    .split('/')
    .filter((part) => part !== '')
    .map((part) => `${encodeURIComponent(part)}.html`)
  return `${WATCH_ORIGIN}/${parts.join('/')}`
}
