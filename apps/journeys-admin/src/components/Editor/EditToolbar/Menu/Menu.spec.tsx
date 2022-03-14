import { MockedProvider } from '@apollo/client/testing'
import { render, fireEvent } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import {
  GetJourney_journey_blocks_TypographyBlock as TypographyBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../../__generated__/GetJourney'
import { Menu } from '.'

describe('EditToolbar Menu', () => {
  it('should render the block menu on icon click', () => {
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
    expect(getByRole('menuitem', { name: 'Edit Block' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Delete Block' })).toBeInTheDocument()
  })

  it('should render the card menu on icon click', () => {
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
    expect(getByRole('menuitem', { name: 'Edit Card' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Delete Card' })).toBeInTheDocument()
  })
})
