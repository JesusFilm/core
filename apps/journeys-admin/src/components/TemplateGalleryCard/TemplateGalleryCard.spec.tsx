import { render, waitFor } from '@testing-library/react'

import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'

import { TemplateGalleryCard } from '.'

describe('TemplateGalleryCard', () => {
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
          __typename: 'Translation',
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
    featuredAt: '2023-08-14T04:24:24.392Z'
  }

  it('should render Template Gallery Card', () => {
    const { getByRole, getByText } = render(
      <TemplateGalleryCard journey={journey} />
    )
    expect(getByRole('img').attributes.getNamedItem('src')?.value).toBe(
      'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920'
    )
    expect(getByText('Aug, 2023 ● English')).toBeInTheDocument()
    expect(
      getByRole('heading', { name: 'A Template Heading' })
    ).toBeInTheDocument()
  })

  it('should return an abbreviated version of the language', () => {
    const { getByText } = render(
      <TemplateGalleryCard
        journey={{
          ...journey,
          language: {
            __typename: 'Language',
            id: '529',
            name: [
              {
                __typename: 'Translation',
                value: 'Kalagan, Tagakalu',
                primary: true
              },
              {
                __typename: 'Translation',
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

  it('should link to template details', async () => {
    const { container } = render(<TemplateGalleryCard journey={journey} />)
    await waitFor(() =>
      expect(
        container.querySelector('div[href="/templates/template-id"]')
      ).toBeInTheDocument()
    )
  })
})
