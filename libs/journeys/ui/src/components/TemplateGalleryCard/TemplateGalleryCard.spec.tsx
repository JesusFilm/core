import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { NextRouter, useRouter } from 'next/router'

import { algoliaJourneys } from '../../libs/algolia/useAlgoliaJourneys/useAlgoliaJourneys.mock'

import { TemplateGalleryCard } from '.'

import '../../../test/i18n'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('TemplateGalleryCard', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      pathname: '/templates'
    } as unknown as NextRouter)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should render Template Gallery Card', () => {
    render(<TemplateGalleryCard item={algoliaJourneys[0]} />)
    expect(screen.getByRole('img').attributes.getNamedItem('src')?.value).toBe(
      '/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2Fe8692352-21c7-4f66-cb57-0298e86a3300%2Fpublic&w=3840&q=75'
    )
    expect(
      screen.getByRole('heading', { name: 'onboarding template3' })
    ).toBeInTheDocument()
  })

  it('should render month and year if not current year', () => {
    render(<TemplateGalleryCard item={algoliaJourneys[0]} />)
    expect(screen.getByText('Aug, 2023 ● English')).toBeInTheDocument()
  })

  it('should return an abbreviated version of the language', () => {
    render(<TemplateGalleryCard item={algoliaJourneys[1]} />)
    expect(screen.getByText('Jul ● Farsi (W)')).toBeInTheDocument()
  })

  it('should link to template details', () => {
    render(<TemplateGalleryCard item={algoliaJourneys[0]} />)
    expect(screen.getByTestId('templateGalleryCard')).toHaveAttribute(
      'href',
      '/templates/template-id-3'
    )
  })

  it('should prioritize image loading', () => {
    render(<TemplateGalleryCard item={algoliaJourneys[0]} priority />)
    expect(screen.getByRole('img')).toHaveAttribute('rel', 'preload')
  })

  it('should not prioritize image loading', () => {
    render(<TemplateGalleryCard item={algoliaJourneys[0]} />)
    expect(screen.getByRole('img')).not.toHaveAttribute('rel')
  })
})

describe('TemplateGalleryCard from different route', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should link to journeys details when not at /templates', () => {
    mockUseRouter.mockReturnValue({
      pathname: '/blah'
    } as unknown as NextRouter)

    render(<TemplateGalleryCard item={algoliaJourneys[0]} />)
    expect(screen.getByTestId('templateGalleryCard')).toHaveAttribute(
      'href',
      '/templates/template-id-3'
    )
  })

  it('should link to journeys details when in watch', () => {
    mockUseRouter.mockReturnValue({
      pathname: '/journeys'
    } as unknown as NextRouter)

    render(<TemplateGalleryCard item={algoliaJourneys[0]} />)
    expect(screen.getByTestId('templateGalleryCard')).toHaveAttribute(
      'href',
      '/journeys/template-id-3'
    )
  })

  it('should focus templategallerycard', async () => {
    mockUseRouter.mockReturnValue({
      pathname: '/journeys'
    } as unknown as NextRouter)
    render(<TemplateGalleryCard item={algoliaJourneys[7]} />)

    await waitFor(async () => await userEvent.tab())
    expect(screen.getByLabelText('templateGalleryCard')).toHaveStyle(
      'outline: 2px solid'
    )
  })
})
