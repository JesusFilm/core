import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'


import { journey } from './data'
import { GoalDetails } from './GoalDetails'


jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn(() => false)
}))

describe('GoalDetails', () => {
  it('should return placeholder text', () => {
    render(
      <MockedProvider>
        <EditorProvider >
          <GoalDetails/>
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Information')).toBeInTheDocument()
    expect(screen.getByText('What are Goals?')).toBeInTheDocument()
    expect(screen.getByText('Start a Conversation')).toBeInTheDocument()
    expect(screen.getByText('Visit a Website')).toBeInTheDocument()
    expect(screen.getByText('Link to Bible')).toBeInTheDocument()
  })

  it('should return action editor', () => {
    render(
      <MockedProvider>
        <EditorProvider >
          <GoalDetails />
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.getByDisplayValue('https://www.google.com/')).toBeInTheDocument()
    expect(screen.getByText('Visit a website')).toBeInTheDocument()
  })

  it('should return action cards', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <GoalDetails />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByText('Appears on the cards')).toBeInTheDocument()
  })
})
