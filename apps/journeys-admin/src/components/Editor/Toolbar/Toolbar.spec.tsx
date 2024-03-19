import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { JourneyStatus } from '../../../../__generated__/globalTypes'

import { Toolbar } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('Toolbar', () => {
  it('should render Toolbar', () => {
    const { getByTestId, getByAltText, getByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: {
                title: 'My Awesome Journey Title',
                description: 'My Awesome Journey Description',
                primaryImageBlock: null,
                status: JourneyStatus.draft
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <Toolbar />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByAltText('Next Steps')).toBeInTheDocument() // NextSteps logo
    expect(getByTestId('ToolbarBackButton')).toHaveAttribute('href', '/')
    expect(getByTestId('ThumbsUpIcon')).toBeInTheDocument()
    expect(getByText('My Awesome Journey Title')).toBeInTheDocument()
    expect(getByText('My Awesome Journey Description')).toBeInTheDocument()
    expect(getByTestId('ItemsStack')).toBeInTheDocument()
    expect(getByTestId('ToolbarMenuButton')).toBeInTheDocument()
  })

  it('should render journey image', () => {
    const { getByAltText, queryByTestId } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: {
                title: 'My Awesome Journey Title',
                description: 'My Awesome Journey Description',
                primaryImageBlock: {
                  id: 'image1.id',
                  __typename: 'ImageBlock',
                  parentBlockId: null,
                  parentOrder: 0,
                  src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
                  alt: 'random image from unsplash',
                  width: 1920,
                  height: 1080,
                  blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
                },
                status: JourneyStatus.draft
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <Toolbar />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(getByAltText('random image from unsplash')).toBeInTheDocument()
    expect(queryByTestId('ThumbsUpIcon')).not.toBeInTheDocument()
  })
})
