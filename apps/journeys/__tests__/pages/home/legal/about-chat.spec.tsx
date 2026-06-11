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

// Mutable i18n state lets the dir tests flip the resolved language without
// re-mocking the module per test.
const i18nState = vi.hoisted(() => ({ language: 'en' }))

vi.mock('next-i18next/pages', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
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
    i18nState.language = 'en'
  })

  it('translates by ?lang when it is shaped like a BCP-47 tag', async () => {
    await getServerSideProps(makeContext({ query: { lang: 'es' } }))

    expect(mockServerSideTranslations).toHaveBeenCalledWith(
      'es',
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
    i18nState.language = 'en'
  })

  it('renders the notice content left-to-right by default', () => {
    render(<AboutChatPage />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'About this chat' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('AboutChatPage')).toHaveAttribute('dir', 'ltr')
  })

  it('renders right-to-left for RTL languages', () => {
    i18nState.language = 'ar'

    render(<AboutChatPage />)

    expect(screen.getByTestId('AboutChatPage')).toHaveAttribute('dir', 'rtl')
  })
})
