import { render, screen } from '@testing-library/react'
import { GetStaticPropsContext } from 'next'

import TemplateGalleryPageRoute, {
  getStaticProps
} from '../../../../pages/home/template-gallery/[slug]'
import { makeGallery } from '../../../../src/components/TemplateGalleryView/galleryFixture'
import { GET_TEMPLATE_GALLERY_PAGE } from '../../../../src/libs/getTemplateGalleryPage'

vi.mock('../../../../src/libs/getFlags', () => ({
  getFlags: vi.fn().mockResolvedValue({})
}))

const mockQuery = vi.fn()
vi.mock('../../../../src/libs/apolloClient', () => ({
  createApolloClient: () => ({ query: mockQuery })
}))

vi.mock('next-i18next/pages/serverSideTranslations', () => ({
  serverSideTranslations: vi.fn().mockResolvedValue({ _nextI18Next: {} })
}))

vi.mock('next-seo', () => ({
  NextSeo: ({
    title,
    description,
    canonical,
    openGraph
  }: {
    title?: string
    description?: string
    canonical?: string
    openGraph?: { images?: Array<{ url: string; alt: string }> }
  }) => (
    <div
      data-testid="NextSeoMock"
      data-title={title}
      data-description={description}
      data-canonical={canonical}
      data-og-images={JSON.stringify(openGraph?.images ?? [])}
    />
  )
}))

vi.mock('../../../../src/components/TemplateGalleryView', () => ({
  TemplateGalleryView: ({
    gallery
  }: {
    gallery: { slug: string; title: string }
  }) => (
    <div
      data-testid="TemplateGalleryViewMock"
      data-gallery-slug={gallery.slug}
      data-gallery-title={gallery.title}
    />
  )
}))

const baseContext = {
  locale: 'en'
} as unknown as GetStaticPropsContext

describe('template-gallery [slug] getStaticProps', () => {
  beforeEach(() => {
    mockQuery.mockReset()
  })

  it('returns notFound for a malformed slug without calling the gateway', async () => {
    const result = await getStaticProps({
      ...baseContext,
      params: { slug: 'BAD_SLUG!!' }
    })

    expect(mockQuery).not.toHaveBeenCalled()
    expect(result).toMatchObject({ notFound: true, revalidate: 60 })
  })

  it('returns notFound when the resolver returns null', async () => {
    mockQuery.mockResolvedValueOnce({
      data: { templateGalleryPageBySlug: null }
    })

    const result = await getStaticProps({
      ...baseContext,
      params: { slug: 'unknown-gallery' }
    })

    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        query: GET_TEMPLATE_GALLERY_PAGE,
        variables: { slug: 'unknown-gallery' },
        errorPolicy: 'all'
      })
    )
    expect(result).toMatchObject({ notFound: true, revalidate: 60 })
  })

  it('returns gallery props when the resolver returns data', async () => {
    const gallery = {
      __typename: 'TemplateGalleryPage',
      id: 'g1',
      slug: 'easter-2026',
      title: 'Easter Gallery',
      description: 'Description',
      creatorName: 'Jane Doe',
      mediaUrl: null,
      publishedAt: null,
      creatorImageSrc: null,
      creatorImageAlt: null,
      templates: []
    }
    mockQuery.mockResolvedValueOnce({
      data: { templateGalleryPageBySlug: gallery }
    })

    const result = await getStaticProps({
      ...baseContext,
      params: { slug: 'easter-2026' }
    })

    expect(result).toMatchObject({
      props: { gallery },
      revalidate: 60
    })
  })
})

describe('TemplateGalleryPageRoute', () => {
  it('renders TemplateGalleryView with the gallery prop', () => {
    const gallery = makeGallery({ slug: 'easter-2026', title: 'Easter Gallery' })
    render(<TemplateGalleryPageRoute gallery={gallery} />)
    const view = screen.getByTestId('TemplateGalleryViewMock')
    expect(view).toHaveAttribute('data-gallery-slug', 'easter-2026')
    expect(view).toHaveAttribute('data-gallery-title', 'Easter Gallery')
  })

  it('wires canonical URL, title, description, and og:image into NextSeo', () => {
    const gallery = makeGallery({
      slug: 'easter-2026',
      title: 'Easter Gallery',
      description: 'A curated set.',
      creatorImageSrc: 'https://example.com/creator.jpg',
      creatorImageAlt: 'Creator avatar'
    })
    render(<TemplateGalleryPageRoute gallery={gallery} />)

    const seo = screen.getByTestId('NextSeoMock')
    expect(seo).toHaveAttribute('data-title', 'Easter Gallery')
    expect(seo).toHaveAttribute('data-description', 'A curated set.')
    expect(seo).toHaveAttribute(
      'data-canonical',
      'https://your.nextstep.is/template-gallery/easter-2026'
    )
    const images = JSON.parse(seo.getAttribute('data-og-images') ?? '[]')
    expect(images).toEqual([
      { url: 'https://example.com/creator.jpg', alt: 'Creator avatar' }
    ])
  })

  it('falls back to the first template image when no creator image is set', () => {
    const gallery = makeGallery({
      creatorImageSrc: null,
      creatorImageAlt: null
      // templates default fixture has one mockTemplate with primaryImageBlock set
    })
    render(<TemplateGalleryPageRoute gallery={gallery} />)
    const images = JSON.parse(
      screen.getByTestId('NextSeoMock').getAttribute('data-og-images') ?? '[]'
    )
    expect(images).toHaveLength(1)
    expect(images[0]).toMatchObject({
      url: 'https://example.com/image.jpg',
      alt: 'Sample image'
    })
  })

  it('emits an empty og:image array when neither creator nor template image exists', () => {
    const gallery = makeGallery({
      creatorImageSrc: null,
      creatorImageAlt: null,
      templates: []
    })
    render(<TemplateGalleryPageRoute gallery={gallery} />)
    expect(
      screen.getByTestId('NextSeoMock').getAttribute('data-og-images')
    ).toBe('[]')
  })
})
