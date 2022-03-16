import { MockedProvider } from '@apollo/client/testing'
import { render, fireEvent } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import {
  GetJourney_journey_blocks_TypographyBlock as TypographyBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey as Journey
} from '../../../../../__generated__/GetJourney'
import { JourneyProvider } from '../../../../libs/context'
import { Menu } from '.'

describe('EditToolbar Menu', () => {
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

    const { getByRole, getByTestId } = render(
      <SnackbarProvider>
        <MockedProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <Menu />
          </EditorProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('button')).toContainElement(getByTestId('MoreVertIcon'))
    fireEvent.click(getByRole('button'))
    expect(getByRole('menu')).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Delete Block' })).toBeInTheDocument()
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

    const { getByRole, getByTestId } = render(
      <SnackbarProvider>
        <MockedProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <Menu />
          </EditorProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('button')).toContainElement(getByTestId('MoreVertIcon'))
    fireEvent.click(getByRole('button'))
    expect(getByRole('menu')).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Delete Card' })).toBeInTheDocument()
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
            value={
              {
                id: 'journeyId',
                slug: 'my-journey'
              } as unknown as Journey
            }
          >
            <EditorProvider initialState={{ selectedBlock }}>
              <Menu />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('button'))
    expect(getByRole('menuitem', { name: 'Journey Settings' })).toHaveAttribute(
      'href',
      '/journeys/my-journey'
    )
  })
})
