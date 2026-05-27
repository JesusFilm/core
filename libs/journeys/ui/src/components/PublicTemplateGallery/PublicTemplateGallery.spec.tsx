import { render, screen, within } from '@testing-library/react'

import { PublicGalleryPageData } from '../PublicGalleryPage'

import { PublicTemplateGallery } from './PublicTemplateGallery'

const data: PublicGalleryPageData = {
  title: 'Digital invitation for events',
  description: 'The templates include event details and a registration form.',
  creatorName: 'Konstantin Konstantinov',
  creatorImageSrc: null,
  creatorImageAlt: null,
  mediaUrl: 'https://www.canva.com/design/DAF/view',
  items: [
    {
      id: 'king-of-kings',
      title: 'King of Kings',
      description: 'A digital invitation for a movie screening.',
      slug: 'king-of-kings',
      createdAt: '2022-07-01T00:00:00.000Z',
      languageName: [{ value: 'English', primary: true }],
      image: { src: 'https://example.com/king.jpg', alt: 'King of Kings' }
    },
    {
      id: 'valentines-quiz',
      title: 'Valentine’s Quiz Battle',
      description: null,
      slug: 'valentines-quiz',
      createdAt: null,
      languageName: [],
      image: null
    }
  ]
}

describe('PublicTemplateGallery', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('renders the header and every template item', () => {
    render(<PublicTemplateGallery data={data} />)

    expect(screen.getByTestId('PublicTemplateGallery')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Digital invitation for events' })
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'The templates include event details and a registration form.'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('Konstantin Konstantinov')).toBeInTheDocument()
    expect(screen.getByText('King of Kings')).toBeInTheDocument()
    expect(screen.getByText('Valentine’s Quiz Battle')).toBeInTheDocument()
    expect(screen.getAllByTestId('PublicTemplateGalleryCard')).toHaveLength(2)
  })

  it('builds the Use link from the item id and the admin url fallback', () => {
    render(<PublicTemplateGallery data={data} />)

    const firstCard = screen.getAllByTestId('PublicTemplateGalleryCard')[0]
    const useLink = within(firstCard).getByRole('link', { name: 'Use' })

    expect(useLink).toHaveAttribute(
      'href',
      'https://admin.nextstep.is/?useTemplate=king-of-kings'
    )
    expect(useLink).toHaveAttribute('target', '_blank')
    expect(useLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('uses NEXT_PUBLIC_JOURNEYS_ADMIN_URL for the Use link when set', () => {
    process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL = 'https://admin.staging.test'
    render(<PublicTemplateGallery data={data} />)

    const firstCard = screen.getAllByTestId('PublicTemplateGalleryCard')[0]
    expect(
      within(firstCard).getByRole('link', { name: 'Use' })
    ).toHaveAttribute(
      'href',
      'https://admin.staging.test/?useTemplate=king-of-kings'
    )
  })

  it('builds the Preview link from the item slug and opens it in a new tab', () => {
    render(<PublicTemplateGallery data={data} />)

    const firstCard = screen.getAllByTestId('PublicTemplateGalleryCard')[0]
    const previewLink = within(firstCard).getByRole('link', { name: 'Preview' })

    expect(previewLink).toHaveAttribute('href', '/king-of-kings')
    expect(previewLink).toHaveAttribute('target', '_blank')
    expect(previewLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders the media embed when mediaUrl is present and omits it when empty', () => {
    const { rerender } = render(<PublicTemplateGallery data={data} />)
    expect(screen.getByTestId('PublicTemplateGalleryMedia')).toBeInTheDocument()

    rerender(<PublicTemplateGallery data={{ ...data, mediaUrl: null }} />)
    expect(
      screen.queryByTestId('PublicTemplateGalleryMedia')
    ).not.toBeInTheDocument()
  })

  it('renders the empty state and no cards when there are no items', () => {
    render(<PublicTemplateGallery data={{ ...data, items: [] }} />)

    expect(
      screen.getByTestId('PublicTemplateGalleryEmptyState')
    ).toBeInTheDocument()
    expect(screen.getByText('No templates to show yet')).toBeInTheDocument()
    expect(
      screen.queryByTestId('PublicTemplateGalleryCard')
    ).not.toBeInTheDocument()
  })
})
