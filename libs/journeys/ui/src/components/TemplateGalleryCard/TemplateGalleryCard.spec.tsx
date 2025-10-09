import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { NextRouter, useRouter } from 'next/router'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { GetJourneys_journeys as Journey } from '../../libs/useJourneysQuery/__generated__/GetJourneys'

import { TemplateGalleryCard } from '.'

import '../../../test/i18n'

jest.mock('@core/journeys/ui/useNavigationState', () => ({
  useNavigationState: jest.fn(() => false)
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

const journey: Journey = {
  __typename: 'Journey',
  id: 'template-id',
  title: 'A Template Heading',
  description: null,
  slug: 'default',
  template: true,
  language: {
    __typename: 'Language',
    id: '529',
    name: [
      {
        __typename: 'LanguageName',
        value: 'English',
        primary: true
      }
    ]
  },
  status: JourneyStatus.published,
  userJourneys: [],
  seoTitle: null,
  seoDescription: null,
  themeName: ThemeName.base,
  themeMode: ThemeMode.dark,
  tags: [],
  trashedAt: null,
  primaryImageBlock: {
    id: 'image1.id',
    __typename: 'ImageBlock',
    parentBlockId: null,
    parentOrder: 0,
    src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
    alt: 'random image from unsplash',
    width: 1920,
    height: 1080,
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
  },
  publishedAt: '2023-08-14T04:24:24.392Z',
  createdAt: '2023-08-14T04:24:24.392Z',
  featuredAt: '2023-08-14T04:24:24.392Z',
  updatedAt: '2021-11-19T12:34:56.647Z'
}

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
    const { getByRole, getByText } = render(
      <TemplateGalleryCard item={journey} />
    )
    expect(getByRole('img').attributes.getNamedItem('src')?.value).toBe(
      '/_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1508363778367-af363f107cbb%3Fixlib%3Drb-1.2.1%26q%3D80%26fm%3Djpg%26crop%3Dentropy%26cs%3Dtinysrgb%26dl%3Dchester-wade-hLP7lVm4KUE-unsplash.jpg%26w%3D1920&w=3840&q=75'
    )
    expect(getByText('Aug, 2023 ● English')).toBeInTheDocument()
    expect(
      getByRole('heading', { name: 'A Template Heading' })
    ).toBeInTheDocument()
  })

  it('should return an abbreviated version of the language', () => {
    const { getByText } = render(
      <TemplateGalleryCard
        item={{
          ...journey,
          language: {
            __typename: 'Language',
            id: '529',
            name: [
              {
                __typename: 'LanguageName',
                value: 'Kalagan, Tagakalu',
                primary: true
              },
              {
                __typename: 'LanguageName',
                value: 'Kalagan, Tagakalu Kalu',
                primary: false
              }
            ]
          }
        }}
      />
    )
    expect(getByText('Aug, 2023 ● Kalagan (TK)')).toBeInTheDocument()
  })

  it('should link to template details', () => {
    const { getByTestId } = render(<TemplateGalleryCard item={journey} />)
    expect(getByTestId('templateGalleryCard')).toHaveAttribute(
      'href',
      '/templates/template-id'
    )
  })

  it('should prioritize image loading', () => {
    const { getByRole } = render(
      <TemplateGalleryCard item={journey} priority />
    )
    expect(getByRole('img')).toHaveAttribute('rel', 'preload')
  })

  it('should not prioritize image loading', () => {
    const { getByRole } = render(<TemplateGalleryCard item={journey} />)
    expect(getByRole('img')).not.toHaveAttribute('rel')
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

    const { getByTestId } = render(<TemplateGalleryCard item={journey} />)
    expect(getByTestId('templateGalleryCard')).toHaveAttribute(
      'href',
      '/templates/template-id'
    )
  })

  it('should link to journeys details when in watch', () => {
    mockUseRouter.mockReturnValue({
      pathname: '/journeys'
    } as unknown as NextRouter)

    const { getByTestId } = render(<TemplateGalleryCard item={journey} />)
    expect(getByTestId('templateGalleryCard')).toHaveAttribute(
      'href',
      '/journeys/template-id'
    )
  })

  xit('should focus templategallerycard', async () => {
    // disabled due to Jest v30 compatibility issues
    mockUseRouter.mockReturnValue({
      pathname: '/journeys'
    } as unknown as NextRouter)
    render(<TemplateGalleryCard item={journey} />)

    await waitFor(async () => await userEvent.tab())
    expect(screen.getByLabelText('templateGalleryCard')).toHaveStyle(
      'outline: 2px solid'
    )
  })
})
