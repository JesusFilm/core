import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { render, screen } from '@testing-library/react'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { type Mock } from 'vitest'

import i18nConfig from '../../../../next-i18next.config'
import HostnameAboutChatPage, {
  getServerSideProps as hostnameGetServerSideProps
} from '../../../../pages/[hostname]/legal/about-chat'
import AboutChatPage, {
  getServerSideProps
} from '../../../../pages/home/legal/about-chat'

vi.mock('next-i18next/pages/serverSideTranslations', () => ({
  serverSideTranslations: vi.fn().mockResolvedValue({ _nextI18Next: {} })
}))

// Mutable i18n state lets the dir tests model the resolved language and
// which strings actually have translations (the component keys direction
// off whether its own copy translated) without re-mocking per test.
const i18nState = vi.hoisted(() => ({
  language: 'en',
  translations: {} as Record<string, string>
}))

function resetI18nState(): void {
  i18nState.language = 'en'
  i18nState.translations = {}
}

vi.mock('next-i18next/pages', () => ({
  useTranslation: () => ({
    t: (key: string) => i18nState.translations[key] ?? key,
    i18n: { language: i18nState.language }
  })
}))

vi.mock('next-seo', () => ({
  NextSeo: () => <div data-testid="NextSeoMock" />
}))

const mockServerSideTranslations = serverSideTranslations as unknown as Mock

function makeContext(
  overrides: Partial<{ query: unknown; locale: string }> = {}
): GetServerSidePropsContext {
  return { query: {}, ...overrides } as unknown as GetServerSidePropsContext
}

describe('about-chat getServerSideProps', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetI18nState()
  })

  it('resolves short language codes to their translation folder (NES-1731)', async () => {
    await getServerSideProps(makeContext({ query: { lang: 'es' } }))

    expect(mockServerSideTranslations).toHaveBeenCalledWith(
      'es-ES',
      ['apps-journeys', 'libs-journeys-ui'],
      expect.anything()
    )

    mockServerSideTranslations.mockClear()
    await getServerSideProps(makeContext({ query: { lang: 'ar' } }))

    expect(mockServerSideTranslations).toHaveBeenCalledWith(
      'ar-SA',
      ['apps-journeys', 'libs-journeys-ui'],
      expect.anything()
    )
  })

  it('canonicalizes letter case before resolving (NES-1729)', async () => {
    await getServerSideProps(makeContext({ query: { lang: 'ES' } }))

    expect(mockServerSideTranslations).toHaveBeenCalledWith(
      'es-ES',
      ['apps-journeys', 'libs-journeys-ui'],
      expect.anything()
    )

    mockServerSideTranslations.mockClear()
    await getServerSideProps(makeContext({ query: { lang: 'AR-sa' } }))

    expect(mockServerSideTranslations).toHaveBeenCalledWith(
      'ar-SA',
      ['apps-journeys', 'libs-journeys-ui'],
      expect.anything()
    )
  })

  it('resolves dialect tags by prefix to their base-language folder (NES-1731)', async () => {
    // Real Arabic journeys carry dialect codes — Gulf (ar-afb), Saidi
    // (ar-aec), MSA Egyptian (ar-arb-EG) — and all must reach the Arabic
    // translations, not fall back to English.
    for (const dialect of ['ar-afb', 'ar-aec', 'ar-arb-EG']) {
      mockServerSideTranslations.mockClear()
      await getServerSideProps(makeContext({ query: { lang: dialect } }))

      expect(mockServerSideTranslations).toHaveBeenCalledWith(
        'ar-SA',
        ['apps-journeys', 'libs-journeys-ui'],
        expect.anything()
      )
    }

    // The longer zh-Hant key must win over the bare zh prefix — Traditional
    // must never resolve to the Simplified folder.
    mockServerSideTranslations.mockClear()
    await getServerSideProps(makeContext({ query: { lang: 'zh-Hant-TW' } }))

    expect(mockServerSideTranslations).toHaveBeenCalledWith(
      'zh-Hant-TW',
      ['apps-journeys', 'libs-journeys-ui'],
      expect.anything()
    )
  })

  it('derives the folder lookup from the i18n config fallbackLng', async () => {
    // The page's map is built from next-i18next.config.js (PR #9292 review) —
    // every entry there must round-trip through ?lang to its folder.
    const fallbackLng = i18nConfig.fallbackLng as Record<string, string[]>

    for (const [language, [folder]] of Object.entries(fallbackLng)) {
      if (language === 'default') continue
      mockServerSideTranslations.mockClear()
      await getServerSideProps(makeContext({ query: { lang: language } }))

      expect(mockServerSideTranslations).toHaveBeenCalledWith(
        folder,
        ['apps-journeys', 'libs-journeys-ui'],
        expect.anything()
      )
    }
  })

  it('maps every libs/locales translation folder in the config fallbackLng', () => {
    // The sync the single-sourcing buys (PR #9292 review): a new locale
    // folder without a fallbackLng entry would silently render English for
    // that language's short code — fail here instead.
    // The runner's cwd varies (apps/journeys locally, the repo root in CI)
    // — walk up from it to wherever libs/locales actually lives.
    let repoDir = process.cwd()
    while (!existsSync(path.join(repoDir, 'libs/locales'))) {
      const parent = path.dirname(repoDir)
      if (parent === repoDir)
        throw new Error('libs/locales not found above cwd')
      repoDir = parent
    }
    const localesDir = path.join(repoDir, 'libs/locales')
    const folders = readdirSync(localesDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== 'en')
      .map((entry) => entry.name)
    const mappedFolders = Object.values(
      i18nConfig.fallbackLng as Record<string, string[]>
    ).map(([folder]) => folder)

    expect(folders.length).toBeGreaterThan(0)
    for (const folder of folders) {
      expect(mappedFolders).toContain(folder)
    }
  })

  it('passes valid-but-unmapped tags through for i18next fallback', async () => {
    await getServerSideProps(makeContext({ query: { lang: 'fa' } }))

    expect(mockServerSideTranslations).toHaveBeenCalledWith(
      'fa',
      ['apps-journeys', 'libs-journeys-ui'],
      expect.anything()
    )
  })

  it('accepts multi-subtag languages like zh-Hans-CN', async () => {
    await getServerSideProps(makeContext({ query: { lang: 'zh-Hans-CN' } }))

    expect(mockServerSideTranslations).toHaveBeenCalledWith(
      'zh-Hans-CN',
      ['apps-journeys', 'libs-journeys-ui'],
      expect.anything()
    )
  })

  it('falls back to the URL locale when no ?lang is given', async () => {
    await getServerSideProps(makeContext({ locale: 'fr' }))

    expect(mockServerSideTranslations).toHaveBeenCalledWith(
      'fr',
      ['apps-journeys', 'libs-journeys-ui'],
      expect.anything()
    )
  })

  it('defaults to English when neither ?lang nor a locale is present', async () => {
    await getServerSideProps(makeContext())

    expect(mockServerSideTranslations).toHaveBeenCalledWith(
      'en',
      ['apps-journeys', 'libs-journeys-ui'],
      expect.anything()
    )
  })

  it('ignores values that are not shaped like a BCP-47 tag', async () => {
    // ?lang feeds i18next's filesystem loader — anything that doesn't look
    // like a language tag (traversal attempts, repeated params, junk) must
    // fall back rather than reach the loader.
    const rejected: unknown[] = [
      '../../../../etc/passwd',
      'es/../en',
      'e',
      'es!',
      'aa-bb-cc-dd-ee-ff',
      ['es', 'fr']
    ]

    for (const lang of rejected) {
      mockServerSideTranslations.mockClear()
      await getServerSideProps(makeContext({ query: { lang } }))

      expect(mockServerSideTranslations).toHaveBeenCalledWith(
        'en',
        ['apps-journeys', 'libs-journeys-ui'],
        expect.anything()
      )
    }
  })

  it('is shared as-is by the [hostname] route', () => {
    // The custom-hostname route re-exports the home page wholesale — if
    // these ever diverge, custom domains lose journey-language translations.
    expect(hostnameGetServerSideProps).toBe(getServerSideProps)
    expect(HostnameAboutChatPage).toBe(AboutChatPage)
  })
})

describe('AboutChatPage', () => {
  beforeEach(() => {
    resetI18nState()
  })

  it('renders the notice content left-to-right by default', () => {
    render(<AboutChatPage />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'About this chat' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('AboutChatPage')).toHaveAttribute('dir', 'ltr')
  })

  it('renders right-to-left when the page copy is translated into an RTL language', () => {
    i18nState.language = 'ar-SA'
    i18nState.translations = { 'About this chat': 'حول هذه المحادثة' }

    render(<AboutChatPage />)

    expect(screen.getByTestId('AboutChatPage')).toHaveAttribute('dir', 'rtl')
  })

  it('renders left-to-right when a requested RTL language has no translations (NES-1731)', () => {
    // `fa` was requested but no Farsi files exist — the text falls back to
    // English, so the layout must NOT be right-aligned.
    i18nState.language = 'fa'
    i18nState.translations = {}

    render(<AboutChatPage />)

    expect(screen.getByTestId('AboutChatPage')).toHaveAttribute('dir', 'ltr')
  })

  it('renders left-to-right for a partially translated RTL locale (NES-1731)', () => {
    // ur-PK has translation files with other strings in them, but this
    // page's copy is still untranslated (pending Crowdin) — the rendered
    // text is the English fallback, so direction must stay LTR even though
    // the locale resolved and its files loaded.
    i18nState.language = 'ur-PK'
    i18nState.translations = { 'Some other string': 'کچھ اور' }

    render(<AboutChatPage />)

    expect(screen.getByTestId('AboutChatPage')).toHaveAttribute('dir', 'ltr')
  })
})
