import { render, screen } from '@testing-library/react'
import JourneyCard from './JourneyCard'
import { GetJourneys_journeys as Journey } from '../../../../__generated__/GetJourneys'
import {
  ThemeName,
  ThemeMode,
  JourneyStatus
} from '../../../../__generated__/globalTypes'

describe('JourneyCard', () => {
  describe('published journey', () => {
    const publishedJourney: Journey = {
      __typename: 'Journey',
      id: 'journey-id',
      title: 'Published Journey Heading',
      description: 'Description',
      themeName: ThemeName.base,
      themeMode: ThemeMode.light,
      slug: 'default',
      locale: 'en_US',
      createdAt: new Date('2021-11-19T12:34:56.647Z'),
      publishedAt: null,
      status: JourneyStatus.published
    }

    it('should render the title', () => {
      const { getAllByText } = render(
        <JourneyCard journey={publishedJourney} />
      )
      expect(getAllByText('Published Journey Heading')[0]).toBeInTheDocument()
    })

    it('should render the formated  date', () => {
      const { getAllByText } = render(
        <JourneyCard journey={publishedJourney} />
      )
      expect(getAllByText('November 19th')[0]).toBeInTheDocument()
    })

    it('should render the description with the dash', () => {
      const { getAllByText } = render(
        <JourneyCard journey={publishedJourney} />
      )
      expect(getAllByText('- Description')[0]).toBeInTheDocument()
    })

    it('should render the published status', () => {
      const { getAllByText } = render(
        <JourneyCard journey={publishedJourney} />
      )
      expect(getAllByText('Published')[0]).toBeInTheDocument()
    })

    it('should not render the draft status', () => {
      const draftStatus = screen.queryByText('Draft')
      expect(draftStatus).not.toBeInTheDocument()
    })

    it('should render the locale captialized', () => {
      const { getAllByText } = render(
        <JourneyCard journey={publishedJourney} />
      )
      expect(getAllByText('EN')[0]).toBeInTheDocument()
    })
  })
  describe('draft journey', () => {
    const draftJourney: Journey = {
      __typename: 'Journey',
      id: 'journey-id',
      title: 'Published Journey Heading',
      description: 'Description',
      themeName: ThemeName.base,
      themeMode: ThemeMode.light,
      slug: 'default',
      locale: 'en_US',
      createdAt: new Date('2021-11-19T12:34:56.647Z'),
      publishedAt: null,
      status: JourneyStatus.draft
    }
    it('should render the draft status', () => {
      const { getAllByText } = render(<JourneyCard journey={draftJourney} />)
      expect(getAllByText('Draft')[0]).toBeInTheDocument()
    })

    it('should not render published status', () => {
      const publishedStatus = screen.queryByText('Published')
      expect(publishedStatus).not.toBeInTheDocument()
    })
  })
})
