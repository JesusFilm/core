import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { JourneyStatus } from '../../../../__generated__/globalTypes'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { Slider } from '@mui/material'
import { Toolbar } from '.'
import { TestEditorState } from '../../../libs/TestEditorState'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('Toolbar', () => {
  const defaultJourney = {
    journey: {
      id: 'journeyId',
      title: 'My Awesome Journey Title',
      description: 'My Awesome Journey Description',
      primaryImageBlock: null,
      status: JourneyStatus.draft
    } as unknown as Journey,
    variant: 'admin'
  }

  const socialImageJourney = {
    journey: {
      title: 'My Awesome Journey Title',
      description: 'My Awesome Journey Description',
      primaryImageBlock: {
        id: 'image1.id',
        __typeame: 'ImageBlock',
        parentBlockId: null,
        parentOrder: 0,
        src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
        alt: 'random image from unsplash',
        width: 1920,
        height: 1080,
        blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
      },
      status: JourneyStatus.draft,
      variant: 'admin'
    } as unknown as Journey,

    variant: 'admin'
  }

  it('should render NextSteps logo on Toolbar', () => {
    render(toolbar(defaultJourney))
    expect(screen.getByAltText('Next Steps')).toBeInTheDocument() // NextSteps logo
  })

  it('should render help scout beacon', () => {
    render(toolbar(defaultJourney))
    expect(screen.getByTestId('HelpScoutBeaconIconButton')).toBeInTheDocument()
  })

  it('should render title & description on Toolbar', () => {
    render(toolbar(defaultJourney))
    expect(screen.getByText('My Awesome Journey Title')).toBeInTheDocument()
    expect(
      screen.getByText('My Awesome Journey Description')
    ).toBeInTheDocument()
  })

  it('should open the title dialog when selected', async () => {
    render(toolbar(defaultJourney))

    fireEvent.click(screen.getByRole('button', { name: 'Click to edit' }))
    await waitFor(() => {
      expect(screen.getByTestId('TitleDescriptionDialog')).toBeInTheDocument()
    })
  })

  it('should render items stack on Toolbar', () => {
    render(toolbar(defaultJourney))
    expect(screen.getByTestId('ItemsStack')).toBeInTheDocument()
  })

  it('should render menu button on Toolbar', () => {
    render(toolbar(defaultJourney))
    expect(screen.getByTestId('ToolbarMenuButton')).toBeInTheDocument()
    expect(screen.getByTestId('MoreIcon')).toBeInTheDocument()
  })

  it('should render all journeys button', () => {
    render(toolbar(defaultJourney))
    expect(screen.getByTestId('ToolbarBackButton')).toHaveAttribute('href', '/')
    expect(screen.getByTestId('FormatListBulletedIcon')).toBeInTheDocument()
  })

  it('should render journeys tooltip on hover', async () => {
    render(toolbar(defaultJourney))
    fireEvent.mouseOver(screen.getByTestId('ToolbarBackButton'))
    await waitFor(() => {
      expect(screen.getByText('See all journeys')).toBeInTheDocument()
    })
  })

  it('should render journey image', () => {
    render(toolbar(socialImageJourney))

    expect(
      screen.getByAltText('random image from unsplash')
    ).toBeInTheDocument()
    expect(screen.queryByTestId('ThumbsUpIcon')).not.toBeInTheDocument()
  })

  it('should open the tooltip when the image is hovered over', async () => {
    render(toolbar(defaultJourney))
    fireEvent.mouseOver(screen.getByTestId('ToolbarSocialImage'))
    await waitFor(() => {
      expect(screen.getByText('Social Image')).toBeInTheDocument()
    })
  })

  it('should open the social preview when the image is clicked', () => {
    render(toolbar(socialImageJourney))

    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('ToolbarSocialImage'))
    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
  })

  function toolbar(journey): ReactElement {
    return (
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={journey}>
            <EditorProvider>
              <TestEditorState />
              <Toolbar />
              <Slider />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
  }
})
