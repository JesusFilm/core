import { toLanguageFallback } from './languageFallback'

vi.mock('./campaignStaticProps', () => ({ CAMPAIGN_REVALIDATE_SECONDS: 60 }))

describe('toLanguageFallback', () => {
  it('turns a redirect into fallback props on the ISR window', () => {
    expect(
      toLanguageFallback({
        redirect: { destination: '/my-journey', permanent: false }
      })
    ).toEqual({
      props: { languageFallback: '/my-journey' },
      revalidate: 60
    })
  })

  it('leaves props and not-found results as they are', () => {
    const props = { props: { a: 1 }, revalidate: 60 }
    expect(toLanguageFallback(props)).toBe(props)
    const notFound = { notFound: true as const, revalidate: 1 }
    expect(toLanguageFallback(notFound)).toBe(notFound)
  })
})
