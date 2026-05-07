import { GetStaticPropsContext } from 'next'

import { GET_TEMPLATE_GALLERY_PAGE } from '../../../src/libs/getTemplateGalleryPage'

import { getStaticProps } from './[slug]'

jest.mock('../../../src/libs/getFlags', () => ({
  getFlags: jest.fn().mockResolvedValue({})
}))

const mockQuery = jest.fn()
jest.mock('../../../src/libs/apolloClient', () => ({
  createApolloClient: () => ({ query: mockQuery })
}))

jest.mock('next-i18next/pages/serverSideTranslations', () => ({
  serverSideTranslations: jest.fn().mockResolvedValue({ _nextI18Next: {} })
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
