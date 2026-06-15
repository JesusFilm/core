// The about-this-chat notice page translates by Next.js URL locale, which
// is always `en` when reached from the chat surfaces (the links carry no
// locale prefix and the journeys app sets `localeDetection: false`). The
// journey viewer translates its UI by `journey.language.bcp47` instead, so
// carry that language to the notice page as a query param — its
// getServerSideProps resolves translations from `?lang` the same way the
// journey page does (NES-1724). English (the default locale) and journeys
// without a bcp47 tag keep the bare href.
export function getAboutChatHref(languageBcp47?: string | null): string {
  if (languageBcp47 == null || languageBcp47 === '' || languageBcp47 === 'en')
    return '/legal/about-chat'

  return `/legal/about-chat?lang=${encodeURIComponent(languageBcp47)}`
}
