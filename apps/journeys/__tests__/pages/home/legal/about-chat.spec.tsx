import { render, screen } from '@testing-library/react'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { type Mock } from 'vitest'

import HostnameAboutChatPage, {
  getServerSideProps as hostnameGetServerSideProps
} from '../../../../pages/[hostname]/legal/about-chat'
import AboutChatPage, {
  getServerSideProps
} from '../../../../pages/home/legal/about-chat'

vi.mock('next-i18next/pages/serverSideTranslations', () => ({
  serverSideTranslations: vi.fn().mockResolvedValue({ _nextI18Next: {} })
}))

// Mutable i18n state lets the dir tests model which translation bundles
// actually loaded (the component walks the fallback chain) without
// re-mocking the module per test.
const i18nState = vi.hoisted(() => ({
  languages: ['en'],
  bundles: { en: { loaded: 'yes' } } as Record<
    string,
    Record<string, string> | undefined
  >
}))

function resetI18nState(): void {
  i18nState.languages = ['en']
  i18nState.bundles = { en: { loaded: 'yes' } }
}

vi.mock('next-i18next/pages', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      languages: i18nState.languages,
      getResourceBundle: (language: string) => i18nState.bundles[language]
    }
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

  it('renders right-to-left when an RTL translation bundle loaded', () => {
    i18nState.languages = ['ar-SA', 'ar', 'en']
    i18nState.bundles = {
      'ar-SA': { loaded: 'yes' },
      en: { loaded: 'yes' }
    }

    render(<AboutChatPage />)

    expect(screen.getByTestId('AboutChatPage')).toHaveAttribute('dir', 'rtl')
  })

  it('renders left-to-right when a requested RTL language has no translations (NES-1731)', () => {
    // `fa` was requested but no Farsi bundle exists — the text falls back to
    // English, so the layout must NOT be right-aligned. Empty bundles (i18next
    // marks failed loads as {}) must be skipped, not counted as loaded.
    i18nState.languages = ['fa', 'en']
    i18nState.bundles = {
      fa: {},
      en: { loaded: 'yes' }
    }

    render(<AboutChatPage />)

    expect(screen.getByTestId('AboutChatPage')).toHaveAttribute('dir', 'ltr')
  })
})
