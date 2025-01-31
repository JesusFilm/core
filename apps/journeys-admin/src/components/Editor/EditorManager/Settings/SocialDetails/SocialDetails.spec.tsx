import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { ActiveSlide, EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { TestEditorState } from '../../../../../libs/TestEditorState'

import { SocialDetails } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('SocialDetails', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  it('should render SocialDetails', () => {
    const { getByText, getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: { status: JourneyStatus.published } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <SocialDetails />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByText('Social Image')).toBeInTheDocument()
    expect(getByText('Change')).toBeInTheDocument()
    expect(getByRole('textbox', { name: 'Title' })).toBeInTheDocument()
    expect(getByRole('textbox', { name: 'Description' })).toBeInTheDocument()
  })

  it('should navigate to journey map when close icon is clicked', async () => {
    render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: { status: JourneyStatus.published } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ activeSlide: ActiveSlide.Content }}>
            <TestEditorState />
            <SocialDetails />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByTestId('X2Icon')).toBeInTheDocument()
    )
    await waitFor(
      async () => await userEvent.click(screen.getByTestId('X2Icon'))
    )

    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
  })
})
