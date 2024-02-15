import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { TreeBlock } from '@core/journeys/ui/block'
import { ActiveContent, EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../__generated__/GetJourney'

import { Toolbar } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('Toolbar', () => {
  it('should render Toolbar', () => {
    const { getAllByRole, getByTestId } = render(
      <SnackbarProvider>
        <MockedProvider>
          <Toolbar />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(
      getAllByRole('button', { name: 'Delete Block Actions' })[0]
    ).toContainElement(getByTestId('Trash2Icon'))
    expect(
      getAllByRole('button', { name: 'Edit Journey Actions' })[0]
    ).toContainElement(getByTestId('MoreIcon'))
  })

  it('should render analytics button', () => {
    const { getByLabelText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: {
                slug: 'untitled-journey',
                tags: []
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <Toolbar />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByLabelText('Analytics')).toBeInTheDocument()
  })

  it('should render Preview Button', () => {
    const { getAllByRole, getAllByTestId } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: {
                slug: 'untitled-journey',
                tags: []
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <Toolbar />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    const button = getAllByRole('link', { name: 'Preview' })[0]
    expect(button).toContainElement(getAllByTestId('EyeOpenIcon')[0])
    expect(button).toHaveAttribute('href', '/api/preview?slug=untitled-journey')
    expect(button).toHaveAttribute('target', '_blank')
    expect(button).not.toBeDisabled()
  })

  it('should disable duplicate button when active journey content is not canvas', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: {
                slug: 'untitled-journey',
                tags: []
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{
                activeContent: ActiveContent.Goals
              }}
            >
              <Toolbar />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(
      getByRole('button', { name: 'Duplicate Block Actions' })
    ).toBeDisabled()
  })

  it('should disable duplicate button when selectedBlock is a video block', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: {
                slug: 'untitled-journey',
                tags: []
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{
                selectedBlock: {
                  __typename: 'VideoBlock'
                } as unknown as TreeBlock<VideoBlock>
              }}
            >
              <Toolbar />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(
      getByRole('button', { name: 'Duplicate Block Actions' })
    ).toBeDisabled()
  })
})
