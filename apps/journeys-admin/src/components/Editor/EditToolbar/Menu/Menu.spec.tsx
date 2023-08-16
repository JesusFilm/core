import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey_blocks_TypographyBlock as TypographyBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../__generated__/GetJourney'
import { JourneyStatus, Role } from '../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../ThemeProvider'

import { GET_ROLE } from './Menu'

import { Menu } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('EditToolbar Menu', () => {
  it('should disable duplicate button when video block is selected', async () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: {
                status: JourneyStatus.draft
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
              <Menu />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Edit Journey Actions' }))
    expect(getByRole('menuitem', { name: 'Duplicate Block' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })

  describe('desktop', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => true)
    )

    it('should open the block menu on icon click', () => {
      const selectedBlock: TreeBlock<TypographyBlock> = {
        id: 'typography0.id',
        __typename: 'TypographyBlock',
        parentBlockId: 'card1.id',
        parentOrder: 0,
        content: 'Title',
        variant: null,
        color: null,
        align: null,
        children: []
      }

      const { getByRole, getByTestId, queryByRole } = render(
        <SnackbarProvider>
          <MockedProvider>
            <JourneyProvider
              value={{
                journey: {
                  status: JourneyStatus.draft
                } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <EditorProvider initialState={{ selectedBlock }}>
                <Menu />
              </EditorProvider>
            </JourneyProvider>
          </MockedProvider>
        </SnackbarProvider>
      )
      expect(getByRole('button')).toContainElement(getByTestId('MoreVertIcon'))
      fireEvent.click(getByRole('button'))
      expect(getByRole('menu')).toBeInTheDocument()
      expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
      expect(
        getByRole('menuitem', { name: 'Delete Block' })
      ).toBeInTheDocument()
      expect(
        queryByRole('menuitem', { name: 'Social Settings' })
      ).not.toBeInTheDocument()
    })

    it('should open the card menu on icon click', () => {
      const selectedBlock: TreeBlock<StepBlock> = {
        __typename: 'StepBlock',
        id: 'stepId',
        parentBlockId: 'journeyId',
        parentOrder: 0,
        locked: true,
        nextBlockId: null,
        children: []
      }

      const { getByRole, getByTestId, queryByRole } = render(
        <SnackbarProvider>
          <MockedProvider>
            <JourneyProvider
              value={{
                journey: {
                  status: JourneyStatus.draft
                } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <EditorProvider initialState={{ selectedBlock }}>
                <Menu />
              </EditorProvider>
            </JourneyProvider>
          </MockedProvider>
        </SnackbarProvider>
      )
      expect(getByRole('button')).toContainElement(getByTestId('MoreVertIcon'))
      fireEvent.click(getByRole('button'))
      expect(getByRole('menu')).toBeInTheDocument()
      expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
      expect(getByRole('menuitem', { name: 'Delete Card' })).toBeInTheDocument()
      expect(
        queryByRole('menuitem', { name: 'Social Settings' })
      ).not.toBeInTheDocument()
    })

    it('should link back to journey on click', () => {
      const selectedBlock: TreeBlock<StepBlock> = {
        __typename: 'StepBlock',
        id: 'stepId',
        parentBlockId: 'journeyId',
        parentOrder: 0,
        locked: true,
        nextBlockId: null,
        children: []
      }

      const { getByRole } = render(
        <SnackbarProvider>
          <MockedProvider>
            <JourneyProvider
              value={{
                journey: {
                  id: 'journeyId',
                  slug: 'my-journey'
                } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <EditorProvider initialState={{ selectedBlock }}>
                <Menu />
              </EditorProvider>
            </JourneyProvider>
          </MockedProvider>
        </SnackbarProvider>
      )

      fireEvent.click(getByRole('button'))
      expect(
        getByRole('menuitem', { name: 'Journey Settings' })
      ).toHaveAttribute('href', '/journeys/journeyId')
    })

    it('should link back to publisher page on click', () => {
      const selectedBlock: TreeBlock<StepBlock> = {
        __typename: 'StepBlock',
        id: 'stepId',
        parentBlockId: 'journeyId',
        parentOrder: 0,
        locked: true,
        nextBlockId: null,
        children: []
      }

      const { getByRole } = render(
        <SnackbarProvider>
          <MockedProvider>
            <JourneyProvider
              value={{
                journey: {
                  id: 'journeyId',
                  slug: 'my-journey',
                  template: true
                } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <EditorProvider initialState={{ selectedBlock }}>
                <Menu />
              </EditorProvider>
            </JourneyProvider>
          </MockedProvider>
        </SnackbarProvider>
      )

      fireEvent.click(getByRole('button'))
      expect(
        getByRole('menuitem', { name: 'Publisher Settings' })
      ).toHaveAttribute('href', '/publisher/journeyId')
    })
  })

  it('should render menu items', () => {
    const selectedBlock: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'stepId',
      parentBlockId: 'journeyId',
      parentOrder: 0,
      locked: true,
      nextBlockId: null,
      children: []
    }
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: {
                id: 'journeyId',
                slug: 'my-journey'
              } as unknown as Journey
            }}
          >
            <EditorProvider initialState={{ selectedBlock }}>
              <Menu />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByRole('button'))
    expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
    expect(
      getByRole('menuitem', { name: 'Duplicate Card' })
    ).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Delete Card' })).toBeInTheDocument()
    expect(
      getByRole('menuitem', { name: 'Journey Settings' })
    ).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Title' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Description' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Language' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Report' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Copy Link' })).toBeInTheDocument()
  })

  it('should render menu items for publishers', async () => {
    const selectedBlock: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'stepId',
      parentBlockId: 'journeyId',
      parentOrder: 0,
      locked: true,
      nextBlockId: null,
      children: []
    }
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_ROLE
              },
              result: {
                data: {
                  getUserRole: {
                    id: '1',
                    userId: 'userId',
                    roles: [Role.publisher]
                  }
                }
              }
            }
          ]}
        >
          <JourneyProvider
            value={{
              journey: {
                id: 'journeyId',
                slug: 'my-journey',
                template: true
              } as unknown as Journey
            }}
          >
            <EditorProvider initialState={{ selectedBlock }}>
              <Menu />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByRole('button'))
    expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
    expect(
      getByRole('menuitem', { name: 'Duplicate Card' })
    ).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Delete Card' })).toBeInTheDocument()
    expect(
      getByRole('menuitem', { name: 'Publisher Settings' })
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(getByRole('menuitem', { name: 'Description' })).toBeInTheDocument()
    })
    expect(getByRole('menuitem', { name: 'Language' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Report' })).toBeInTheDocument()
  })

  describe('mobile', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => false)
    )

    it('should display opens social share drawer when card is selected', () => {
      const selectedBlock: TreeBlock<StepBlock> = {
        __typename: 'StepBlock',
        id: 'stepId',
        parentBlockId: 'journeyId',
        parentOrder: 0,
        locked: true,
        nextBlockId: null,
        children: []
      }

      const { getByRole, getByText } = render(
        <SnackbarProvider>
          <MockedProvider>
            <JourneyProvider
              value={{
                journey: {
                  status: JourneyStatus.draft
                } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <EditorProvider initialState={{ selectedBlock }}>
                <ThemeProvider>
                  <Menu />
                </ThemeProvider>
              </EditorProvider>
            </JourneyProvider>
          </MockedProvider>
        </SnackbarProvider>
      )
      fireEvent.click(getByRole('button'))
      expect(
        getByRole('menuitem', { name: 'Social Settings' })
      ).toBeInTheDocument()

      fireEvent.click(getByRole('menuitem', { name: 'Social Settings' }))
      expect(getByText('Social Settings')).toBeInTheDocument()
    })

    it('should display and opens social share drawer when block is selected', () => {
      const selectedBlock: TreeBlock<TypographyBlock> = {
        id: 'typography0.id',
        __typename: 'TypographyBlock',
        parentBlockId: 'card1.id',
        parentOrder: 0,
        content: 'Title',
        variant: null,
        color: null,
        align: null,
        children: []
      }

      const { getByRole, getByText } = render(
        <SnackbarProvider>
          <MockedProvider>
            <JourneyProvider
              value={{
                journey: {
                  status: JourneyStatus.draft
                } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <EditorProvider initialState={{ selectedBlock }}>
                <ThemeProvider>
                  <Menu />
                </ThemeProvider>
              </EditorProvider>
            </JourneyProvider>
          </MockedProvider>
        </SnackbarProvider>
      )
      fireEvent.click(getByRole('button'))
      expect(
        getByRole('menuitem', { name: 'Social Settings' })
      ).toBeInTheDocument()

      fireEvent.click(getByRole('menuitem', { name: 'Social Settings' }))
      expect(getByText('Social Settings')).toBeInTheDocument()
    })
  })
})
