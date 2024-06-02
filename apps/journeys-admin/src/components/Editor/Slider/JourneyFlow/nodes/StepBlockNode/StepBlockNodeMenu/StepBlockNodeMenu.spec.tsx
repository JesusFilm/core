import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../../__generated__/BlockFields'

import { StepBlockNodeMenu } from './StepBlockNodeMenu'

describe('StepBlockNodeMenu', () => {
  const step: TreeBlock<StepBlock> = {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    nextBlockId: null,
    parentOrder: 0,
    locked: false,
    children: []
  }

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
})
