import { fireEvent, render, screen } from "@testing-library/react"
import { MediaScreen } from "./MediaScreen"
import { MockedProvider, MockedResponse } from "@apollo/client/testing"
import { JourneyProvider } from "@core/journeys/ui/JourneyProvider"
import { journey } from "@core/journeys/ui/JourneyProvider/JourneyProvider.mock"

describe('MediaScreen', () => {
    const handleNext = jest.fn()

    const baseJourney = {
        ...journey,
        id: 'test-journey-id',
        seoTitle: 'Initial SEO Title',
        seoDescription: 'Initial SEO Description'
      }

    const renderMediaScreen = (mocks: MockedResponse[] = []): ReturnType<typeof render> => {
        return render(
            <MockedProvider mocks={mocks}>
                <JourneyProvider value={{ journey: baseJourney, variant: 'admin' }}>
                    <MediaScreen handleNext={handleNext} />
                </JourneyProvider>
            </MockedProvider>
        )
    }

  it('should render the MediaScreen', () => {
    render(<MediaScreen handleNext={handleNext} />)
    expect(screen.getByText('Media')).toBeInTheDocument()
    expect(screen.getByTestId('CustomizeFlowNextButton')).toHaveTextContent('Next')
  })

  it('should call handleNext when Done button is clicked without any changes', () => {
    renderMediaScreen()

    const doneButton = screen.getByTestId('CustomizeFlowNextButton')
    fireEvent.click(doneButton)

    expect(handleNext).toHaveBeenCalledTimes(1)
  })

})