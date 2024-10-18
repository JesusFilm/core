import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { isIPhone } from '@core/shared/ui/deviceUtils'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../../__generated__/BlockFields'

import { StepBlockNodeMenu } from './StepBlockNodeMenu'

jest.mock('@core/shared/ui/deviceUtils', () => {
  return {
    isIPhone: jest.fn()
  }
})

const mockIsIPhone = isIPhone as jest.MockedFunction<typeof isIPhone>

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
    mockIsIPhone.mockReturnValueOnce(true)
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
    expect(mockIsIPhone).toHaveBeenCalled()
  })
})
