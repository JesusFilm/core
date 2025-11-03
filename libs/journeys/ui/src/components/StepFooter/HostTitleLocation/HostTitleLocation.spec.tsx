import { render } from '@testing-library/react'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../libs/JourneyProvider'

import { HostTitleLocation } from './HostTitleLocation'

describe('HostTitleLocation', () => {
  const journey = {
    __typename: 'Journey' as const,
    id: 'journeyId',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    title: 'my journey',
    featuredAt: null,
    strategySlug: null,
    slug: 'my-journey',
    language: {
      __typename: 'Language' as const,
      id: '529',
      bcp47: 'en',
      iso3: 'eng',
      name: [
        {
          __typename: 'LanguageName' as const,
          value: 'English',
          primary: true
        }
      ]
    },
    description: 'my cool journey',
    status: JourneyStatus.draft,
    createdAt: '2021-11-19T12:34:56.647Z',
    updatedAt: '2021-11-19T12:34:56.647Z',
    publishedAt: null,
    blocks: [],
    primaryImageBlock: null,
    creatorDescription: null,
    creatorImageBlock: null,
    userJourneys: [],
    template: null,
    seoTitle: null,
    seoDescription: null,
    chatButtons: [],
    host: {
      id: 'hostId',
      __typename: 'Host' as const,
      title: 'Edmond Shen',
      location: 'Student Life',
      teamId: 'teamId',
      src1: null,
      src2: null
    },
    team: null,
    tags: [],
    website: null,
    showShareButton: null,
    showLikeButton: null,
    showDislikeButton: null,
    displayTitle: null,
    logoImageBlock: null,
    menuButtonIcon: null,
    menuStepBlock: null,
    journeyTheme: null,
    journeyCustomizationDescription: null,
    journeyCustomizationFields: [],
    fromTemplateId: null,
    socialNodeX: null,
    socialNodeY: null
  }

  const rtlLanguage = {
    __typename: 'Language' as const,
    id: '529',
    bcp47: 'ar',
    iso3: 'arb',
    name: [
      {
        __typename: 'LanguageName' as const,
        value: 'Arabic',
        primary: false
      }
    ]
  }

  it('renders the name and location correctly', () => {
    const { getByText } = render(
      <JourneyProvider value={{ journey }}>
        <HostTitleLocation />
      </JourneyProvider>
    )

    expect(getByText('Edmond Shen · Student Life')).toBeInTheDocument()
  })

  it('renders location then name when RTL', () => {
    const { getByText } = render(
      <JourneyProvider
        value={{ journey: { ...journey, language: rtlLanguage } }}
      >
        <HostTitleLocation />
      </JourneyProvider>
    )

    expect(getByText('Student Life · Edmond Shen')).toBeInTheDocument()
  })

  it('renders only the name when location is not provided', () => {
    const { getByText, queryByText } = render(
      <JourneyProvider
        value={{
          journey: { ...journey, host: { ...journey.host, location: null } }
        }}
      >
        <HostTitleLocation />
      </JourneyProvider>
    )

    const nameElement = getByText('Edmond Shen')
    const locationElement = queryByText(' · Student Life')

    expect(nameElement).toBeInTheDocument()
    expect(locationElement).toBeNull()
  })
})
