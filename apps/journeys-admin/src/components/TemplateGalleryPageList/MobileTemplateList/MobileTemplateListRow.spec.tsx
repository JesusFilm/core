import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import '../../../../test/i18n'

import {
  customizableTemplateJourney,
  customizableWebsiteTemplateJourney,
  defaultJourney
} from '../../JourneyList/journeyListData'
import { ThemeProvider } from '../../ThemeProvider'

import { MobileTemplateListRow } from './MobileTemplateListRow'

function renderRow(
  journey: typeof defaultJourney = defaultJourney
): ReturnType<typeof render> {
  return render(
    <SnackbarProvider>
      <MockedProvider>
        <ThemeProvider>
          <MobileTemplateListRow journey={journey} />
        </ThemeProvider>
      </MockedProvider>
    </SnackbarProvider>
  )
}

describe('MobileTemplateListRow', () => {
  it('renders the title as a link to the journey detail page', () => {
    renderRow()
    // CardActionArea(component={NextLink}) renders an <a>; assert the href.
    expect(
      screen.getByRole('link', { name: /Default Journey Heading/ })
    ).toHaveAttribute('href', '/journeys/journey-id')
  })

  it('renders a 3-dot menu button on each row', () => {
    renderRow()
    expect(screen.getByTestId('JourneyCardMenuButton')).toBeInTheDocument()
  })

  it('renders a dedicated drag handle column', () => {
    renderRow()
    expect(
      screen.getByTestId('MobileTemplateListRowDragHandleColumn')
    ).toBeInTheDocument()
  })

  it('renders the Quick Start corner badge when the template is customizable', () => {
    renderRow(customizableTemplateJourney)
    expect(screen.getByLabelText('Quick Start')).toBeInTheDocument()
  })

  it('renders both Quick Start and Website corner badges when applicable', () => {
    renderRow(customizableWebsiteTemplateJourney)
    expect(screen.getByLabelText('Quick Start')).toBeInTheDocument()
    expect(screen.getByLabelText('Website')).toBeInTheDocument()
  })
})
