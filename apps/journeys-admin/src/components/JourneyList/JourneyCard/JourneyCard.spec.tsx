import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { useNavigationState } from '@core/journeys/ui/useNavigationState'

import {
  GetTemplateFamilyStatsAggregate,
  GetTemplateFamilyStatsAggregateVariables
} from '../../../../__generated__/GetTemplateFamilyStatsAggregate'
import { IdType } from '../../../../__generated__/globalTypes'
import { GET_TEMPLATE_FAMILY_STATS_AGGREGATE } from '../../../libs/useTemplateFamilyStatsAggregateLazyQuery'
import { ThemeProvider } from '../../ThemeProvider'
import {
  customizableTemplateJourney,
  customizableWebsiteTemplateJourney,
  defaultJourney,
  fakeDate,
  journeyWithImage,
  publishedLocalTemplate,
  websiteJourney
} from '../journeyListData'

import { JourneyCard } from './JourneyCard'
import { JourneyCardVariant } from './journeyCardVariant'

jest.mock('@core/journeys/ui/useNavigationState', () => ({
  useNavigationState: jest.fn(() => false)
}))

const mockUseNavigationState = useNavigationState as jest.MockedFunction<
  typeof useNavigationState
>

jest.mock('./JourneyCardMenu', () => ({
  JourneyCardMenu: ({ setIsDialogOpen }: { setIsDialogOpen: (isDialogOpen: boolean) => void }) => (
    <button data-testid="open-dialog" onClick={() => setIsDialogOpen(true)} />
  )
}))
  
describe('JourneyCard', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(fakeDate))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('should have correct link on title', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyCard journey={defaultJourney} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(
      screen.getByRole('link', {
        name: 'No Image Default Journey Heading English • 11 months ago'
      })
    ).toHaveAttribute('href', '/journeys/journey-id')
  })

  it('should disabled card when navigating', () => {
    mockUseNavigationState.mockReturnValue(true)

    render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyCard journey={defaultJourney} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const link = screen.getByRole('link', {
      name: 'No Image Default Journey Heading English • 11 months ago'
    })
    expect(link).toHaveClass('Mui-disabled')
  })

  it('should show Image element when primaryImageBlock.src exists', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyCard journey={journeyWithImage} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(
      screen.getByRole('img', { name: 'Test Social Media Image' })
    ).toBeInTheDocument()
  })

  it('should not show Image element when primaryImageBlock.src is null. Instead, show a grayscale logo', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyCard journey={defaultJourney} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(screen.queryByTestId('JourneyCardImage')).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'No Image' })).toBeInTheDocument()
  })

  it('should show "New" chip for new journey card variant', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyCard
              journey={defaultJourney}
              variant={JourneyCardVariant.new}
            />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(screen.getByTestId('new-journey-badge')).toBeInTheDocument()
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('should show quick start badge when journey is template and customizable', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyCard journey={customizableTemplateJourney} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(screen.getByTestId('JourneyCardQuickStartBadge')).toBeInTheDocument()
    expect(screen.getByText('Quick Start')).toBeInTheDocument()
    expect(
      screen.queryByTestId('JourneyCardWebsiteBadge')
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Website')).not.toBeInTheDocument()
  })

  it('should show website badge when journey is website', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyCard journey={websiteJourney} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(screen.getByTestId('JourneyCardWebsiteBadge')).toBeInTheDocument()
    expect(screen.getByText('Website')).toBeInTheDocument()
    expect(
      screen.queryByTestId('JourneyCardQuickStartBadge')
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Quick Start')).not.toBeInTheDocument()
  })

  it('should show both badges when journey is template and customizable and website', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyCard journey={customizableWebsiteTemplateJourney} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(screen.getByTestId('JourneyCardQuickStartBadge')).toBeInTheDocument()
    expect(screen.getByText('Quick Start')).toBeInTheDocument()
    expect(screen.getByTestId('JourneyCardWebsiteBadge')).toBeInTheDocument()
    expect(screen.getByText('Website')).toBeInTheDocument()
  })

  it('should not show badges when journey is not template and customizable and website', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyCard journey={defaultJourney} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(
      screen.queryByTestId('JourneyCardQuickStartBadge')
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Quick Start')).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('JourneyCardWebsiteBadge')
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Website')).not.toBeInTheDocument()
  })

  it('should show journey analytics for default journey card', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyCard journey={defaultJourney} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(screen.getByTestId('JourneyCardInfo')).toBeInTheDocument()
  })
  
  it('does not change hover state when dialog is open', async () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyCard journey={defaultJourney} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
  
    const card = screen.getByTestId('JourneyCard-journey-id')
    const overlay = screen.getByTestId('JourneyCardOverlayBox')
  
    expect(overlay).toHaveStyle({ opacity: '0' })

    fireEvent.mouseEnter(card)
    expect(overlay).toHaveStyle({ opacity: '1' })
    
    fireEvent.mouseLeave(card)
    expect(overlay).toHaveStyle({ opacity: '0' })
  
    fireEvent.click(screen.getByTestId('open-dialog'))
  
    await waitFor(() => {
      fireEvent.mouseLeave(card)
    })
  
    fireEvent.mouseEnter(card)
    
    expect(overlay).toHaveStyle({ opacity: '0' })
  })

  // MARK: Remove this once Siyang Cao + Mike Alison implement updated journey analytics feature
  it('TEMP - should not show journey analytics for local template card', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyCard journey={publishedLocalTemplate} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(screen.queryByTestId('JourneyCardInfo')).not.toBeInTheDocument()
  })

  it('should show template only section', async () => {
    const templateFamilyStatsAggregateMock: MockedResponse<
      GetTemplateFamilyStatsAggregate,
      GetTemplateFamilyStatsAggregateVariables
    > = {
      request: {
        query: GET_TEMPLATE_FAMILY_STATS_AGGREGATE,
        variables: {
          id: publishedLocalTemplate.id,
          idType: IdType.databaseId,
          where: {}
        }
      },
      result: {
        data: {
          templateFamilyStatsAggregate: {
            __typename: 'TemplateFamilyStatsAggregateResponse',
            childJourneysCount: 10,
            totalJourneysViews: 100,
            totalJourneysResponses: 50
          }
        }
      }
    }

    render(
      <SnackbarProvider>
        <MockedProvider mocks={[templateFamilyStatsAggregateMock]}>
          <ThemeProvider>
            <JourneyCard journey={publishedLocalTemplate} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('Data1Icon')).toBeInTheDocument()
    })
  })
})
