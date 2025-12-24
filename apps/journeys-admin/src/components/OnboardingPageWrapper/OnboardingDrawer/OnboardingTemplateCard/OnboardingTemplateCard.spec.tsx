import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'

import { GET_JOURNEY } from '@core/journeys/ui/useJourneyQuery'

import type { GetJourneys_journeys as Journey } from '../../../../../__generated__/GetJourneys'
import {
  IdType,
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../__generated__/globalTypes'

import { OnboardingTemplateCard } from './OnboardingTemplateCard'

describe('OnboardingTemplateCard', () => {
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
    updatedAt: '2023-08-14T04:24:24.392Z'
  }

  it('should render OnboardingTemplateCard', async () => {
    const result = jest.fn(() => ({ data: { journey } }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_JOURNEY,
              variables: {
                id: 'template-id',
                idType: IdType.databaseId
              }
            },
            result
          }
        ]}
      >
        <OnboardingTemplateCard templateId="template-id" />
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getAllByText('Journey Template')[0]).toBeInTheDocument()
    await waitFor(() =>
      expect(
        screen.getByRole('img').attributes.getNamedItem('src')?.value
      ).toBe(
        'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920'
      )
    )
    expect(screen.getAllByText('A Template Heading')[0]).toBeInTheDocument()
  })
})
