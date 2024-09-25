import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, within } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { Menu } from './Menu'

describe('Menu', () => {
  it('should render', () => {
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <EditorProvider>
            <Menu />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const accordion = screen.getByTestId('AccordionSummary')
    expect(accordion).toBeInTheDocument()
    expect(within(accordion).getByText('Menu')).toBeInTheDocument()
    expect(within(accordion).getByRole('checkbox')).toBeInTheDocument()

    fireEvent.click(accordion)

    expect(screen.getByTestId('MenuIconSelect')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Create Menu Card' })
    ).toBeInTheDocument()
  })
})
