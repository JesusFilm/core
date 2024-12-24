import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { isIOSTouchScreen } from '@core/shared/ui/deviceUtils'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../../__generated__/BlockFields'

import { StepBlockNodeMenu } from './StepBlockNodeMenu'

jest.mock('@core/shared/ui/deviceUtils', () => {
  return {
    isIOSTouchScreen: jest.fn()
  }
})

const mockIsIOSTouchScreen = isIOSTouchScreen as jest.MockedFunction<
  typeof isIOSTouchScreen
>

describe('StepBlockNodeMenu', () => {
  const step: TreeBlock<StepBlock> = {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    nextBlockId: null,
    parentOrder: 0,
    locked: false,
    slug: null,
    children: []
  }

  beforeEach(() => jest.clearAllMocks())

  it('should open menu on click', async () => {
    const { getByTestId, getByRole, queryByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <StepBlockNodeMenu step={step} />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getByTestId('EditStepFab')).toBeInTheDocument()
    })
    expect(queryByTestId('StepBlockNodeMenu')).not.toBeInTheDocument()

    fireEvent.click(getByTestId('EditStepFab'))
    await waitFor(() => {
      expect(queryByTestId('StepBlockNodeMenu')).toBeInTheDocument()
    })
    expect(
      getByRole('menuitem', { name: 'Duplicate Card' })
    ).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Delete Card' })).toBeInTheDocument()
  })

  it('should open menu on tap for iOS', async () => {
    mockIsIOSTouchScreen.mockReturnValueOnce(true)
    const { getByTestId, queryByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <StepBlockNodeMenu step={step} />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getByTestId('EditStepFab')).toBeInTheDocument()
    })
    expect(queryByTestId('StepBlockNodeMenu')).not.toBeInTheDocument()

    fireEvent.mouseEnter(getByTestId('EditStepFab'))
    await waitFor(() => {
      expect(queryByTestId('StepBlockNodeMenu')).toBeInTheDocument()
    })
    expect(mockIsIOSTouchScreen).toHaveBeenCalled()
  })

  it('should have edit-step id on fab', async () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <StepBlockNodeMenu step={step} />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('EditStepFab')).toBeInTheDocument()
    })
    const fab = screen.getByTestId('EditStepFab')
    expect(fab).toHaveAttribute('id', 'edit-step')
  })

  it('should have StepBlockNodeMenuIcon id on fab icon', async () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <StepBlockNodeMenu step={step} />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('EditStepFabIcon')).toBeInTheDocument()
    })
    const fabIcon = screen.getByTestId('EditStepFabIcon')
    expect(fabIcon).toHaveAttribute('id', 'StepBlockNodeMenuIcon')
  })
})
