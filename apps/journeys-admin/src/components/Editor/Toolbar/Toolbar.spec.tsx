import { MockedProvider } from '@apollo/client/testing'
import Slider from '@mui/material/Slider'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { TestEditorState } from '../../../libs/TestEditorState'

import { Toolbar } from '.'

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
    const { getByAltText } = render(toolbar(defaultJourney))
    expect(getByAltText('Next Steps')).toBeInTheDocument() // NextSteps logo
  })

  it('should render title & description on Toolbar', () => {
    const { getByText } = render(toolbar(defaultJourney))
    expect(getByText('My Awesome Journey Title')).toBeInTheDocument()
    expect(getByText('My Awesome Journey Description')).toBeInTheDocument()
  })

  it('should open the title dialog when selected', async () => {
    render(toolbar(defaultJourney))

    fireEvent.click(screen.getByRole('button', { name: 'Click to edit' }))
    await waitFor(() => {
      expect(screen.getByTestId('TitleDescriptionDialog')).toBeInTheDocument()
    })
  })

  it('should render items stack on Toolbar', () => {
    const { getByTestId } = render(toolbar(defaultJourney))
    expect(getByTestId('ItemsStack')).toBeInTheDocument()
  })

  it('should render menu button on Toolbar', () => {
    const { getByTestId } = render(toolbar(defaultJourney))
    expect(getByTestId('ToolbarMenuButton')).toBeInTheDocument()
    expect(getByTestId('MoreIcon')).toBeInTheDocument()
  })

  it('should render all journeys button', () => {
    const { getByTestId } = render(toolbar(defaultJourney))
    expect(getByTestId('ToolbarBackButton')).toHaveAttribute('href', '/')
    expect(getByTestId('FormatListBulletedIcon')).toBeInTheDocument()
  })

  it('should render journeys tooltip on hover', async () => {
    const { getByTestId, getByText } = render(toolbar(defaultJourney))
    fireEvent.mouseOver(getByTestId('ToolbarBackButton'))
    await waitFor(() => {
      expect(getByText('See all journeys')).toBeInTheDocument()
    })
  })

  it('should render journey image', () => {
    const { getByAltText, queryByTestId } = render(toolbar(socialImageJourney))

    expect(getByAltText('random image from unsplash')).toBeInTheDocument()
    expect(queryByTestId('ThumbsUpIcon')).not.toBeInTheDocument()
  })

  it('should open the tooltip when the image is hovered over', async () => {
    const { getByTestId, getByText } = render(toolbar(defaultJourney))
    fireEvent.mouseOver(getByTestId('ToolbarSocialImage'))
    await waitFor(() => {
      expect(getByText('Social Image')).toBeInTheDocument()
    })
  })

  it('should open the social preview when the image is clicked', () => {
    const { getByText, getByTestId } = render(toolbar(socialImageJourney))

    expect(getByText('activeSlide: 0')).toBeInTheDocument()
    fireEvent.click(getByTestId('ToolbarSocialImage'))
    expect(getByText('activeSlide: 1')).toBeInTheDocument()
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
