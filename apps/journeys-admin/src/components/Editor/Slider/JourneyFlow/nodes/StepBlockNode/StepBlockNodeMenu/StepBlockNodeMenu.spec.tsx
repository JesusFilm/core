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
    const { getByTestId, getByRole, queryByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <StepBlockNodeMenu step={step} />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getByTestId('edit-step-fab')).toBeInTheDocument()
    })
    expect(queryByRole('menu')).not.toBeInTheDocument()

    fireEvent.click(getByTestId('edit-step-fab'))
    await waitFor(() => {
      expect(queryByRole('menu')).toBeInTheDocument()
    })
    expect(
      getByRole('menuitem', { name: 'Duplicate Card' })
    ).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Delete Card' })).toBeInTheDocument()
  })
})
