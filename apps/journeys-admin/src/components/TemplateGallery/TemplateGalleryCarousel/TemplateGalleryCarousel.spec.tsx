import { render } from '@testing-library/react'

import { GetJourneys_journeys as Journey } from '../../../../__generated__/GetJourneys'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../__generated__/globalTypes'

import { TemplateGalleryCarousel } from './TemplateGalleryCarousel'

describe('TemplateGalleryCarousel', () => {
  const journey: Journey = {
    __typename: 'Journey',
    id: '1',
    title: 'Featured Template 1',
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
    primaryImageBlock: null,
    publishedAt: '2023-08-14T04:24:24.392Z',
    createdAt: '2023-08-14T04:24:24.392Z',
    featuredAt: '2023-08-14T04:24:24.392Z'
  }

  it('should render TemplateGalleryCarousel', () => {
    const { getAllByTestId, getByRole } = render(
      <TemplateGalleryCarousel
        category="Easter"
        journeys={[
          journey,
          { ...journey, id: '2', title: 'Featured Template 2' }
        ]}
      />
    )
    expect(getByRole('heading', { name: 'Easter' })).toBeInTheDocument()
    const cards = getAllByTestId(/journey-/)
    expect(cards[0]).toHaveTextContent('Featured Template 1')
    expect(cards[1]).toHaveTextContent('Featured Template 2')
  })
})
