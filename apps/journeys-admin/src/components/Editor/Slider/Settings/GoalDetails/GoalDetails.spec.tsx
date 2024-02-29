import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { ThemeProvider } from '../../../../ThemeProvider'

import { GoalDetails } from './GoalDetails'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('GoalDetails', () => {
  it('should return placeholder text', () => {
    const { getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <GoalDetails />
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByText('What are Goals?')).toBeInTheDocument()
    expect(getByText('Start a Conversation')).toBeInTheDocument()
    expect(getByText('Visit a Website')).toBeInTheDocument()
    expect(getByText('Link to Bible')).toBeInTheDocument()
  })

  it('should return action editor', () => {
    const { getByDisplayValue, getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <EditorProvider
            initialState={{ selectedGoalUrl: 'https://www.google.com/' }}
          >
            <GoalDetails />
          </EditorProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByDisplayValue('https://www.google.com/')).toBeInTheDocument()
    expect(getByText('Visit a Website')).toBeInTheDocument()
    expect(getByText('Appears on the cards')).toBeInTheDocument()
  })
})
