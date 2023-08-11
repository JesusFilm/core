import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey_blocks_TypographyBlock as TypographyBlock
} from '../../../../../__generated__/GetJourney'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../ThemeProvider'

import { Menu } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('ContextEditActions Menu', () => {
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
