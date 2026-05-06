import { render, screen } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields } from '../../../../../__generated__/JourneyFields'

import { JourneyDetails } from './JourneyDetails'

describe('JourneyDetails', () => {
  const mockJourney: JourneyFields = {
    title: 'Some title',
    description: 'Some description',
    language: {
      __typename: 'Language',
      id: '529',
      name: [
        {
          value: 'English',
          primary: true,
          __typename: 'LanguageName'
        }
      ]
    }
  } as unknown as JourneyFields

  const noDescriptionJourney: JourneyFields = {
    ...mockJourney,
    description: ''
  } as unknown as JourneyFields

  it('should display title, globe, dot, language and description', () => {
    render(
      <JourneyProvider value={{ journey: mockJourney }}>
        <JourneyDetails />
      </JourneyProvider>
    )
    expect(screen.getByText('Some title')).toBeInTheDocument()
    expect(screen.getByTestId('Globe1Icon')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.queryByTestId('DescriptionDot')).toBeInTheDocument()
    expect(screen.getByText('Some description')).toBeInTheDocument()
  })

  it('should not show dot if there is no description', () => {
    render(
      <JourneyProvider value={{ journey: noDescriptionJourney }}>
        <JourneyDetails />
      </JourneyProvider>
    )
    expect(screen.queryByTestId('DescriptionDot')).not.toBeInTheDocument()
    expect(screen.queryByText('Some description')).not.toBeInTheDocument()
  })

  it('should not render TEMPLATE badge for non-template journey', () => {
    render(
      <JourneyProvider value={{ journey: mockJourney }}>
        <JourneyDetails />
      </JourneyProvider>
    )
    expect(screen.queryByTestId('TemplateBadge')).not.toBeInTheDocument()
  })

  it('should render TEMPLATE badge when journey.template is true', () => {
    const templateJourney: JourneyFields = {
      ...mockJourney,
      template: true
    } as unknown as JourneyFields

    render(
      <JourneyProvider value={{ journey: templateJourney }}>
        <JourneyDetails />
      </JourneyProvider>
    )
    expect(screen.getByTestId('TemplateBadge')).toBeInTheDocument()
    expect(screen.getByText('TEMPLATE')).toBeInTheDocument()
  })
})
