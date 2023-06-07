import { render } from '@testing-library/react'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../libs/JourneyProvider/__generated__/JourneyFields'
import { StepFooter } from './StepFooter'

describe('StepFooter', () => {
  const journey: Journey = {
    __typename: 'Journey',
    id: 'journeyId',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    title: 'my journey',
    slug: 'my-journey',
    language: {
      __typename: 'Language',
      id: '529',
      bcp47: 'en',
      iso3: 'eng',
      name: [
        {
          __typename: 'Translation',
          value: 'English',
          primary: true
        }
      ]
    },
    description: 'my cool journey',
    status: JourneyStatus.draft,
    createdAt: '2021-11-19T12:34:56.647Z',
    publishedAt: null,
    blocks: [],
    primaryImageBlock: null,
    userJourneys: [],
    template: null,
    seoTitle: 'My awesome journey',
    seoDescription: null
  }

  it('should display social media journey title by default', () => {
    const { getByText } = render(
      <JourneyProvider value={{ journey }}>
        <StepFooter />
      </JourneyProvider>
    )

    expect(getByText('My awesome journey')).toBeInTheDocument()
  })

  it('should display journey title if no social media title', () => {
    const { getByText } = render(
      <JourneyProvider value={{ journey }}>
        <StepFooter />
      </JourneyProvider>
    )

    expect(getByText('my journey')).toBeInTheDocument()
  })
})
