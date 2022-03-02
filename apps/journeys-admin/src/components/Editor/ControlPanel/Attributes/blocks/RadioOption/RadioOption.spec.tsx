import { fireEvent, render, waitFor } from '@testing-library/react'
import { TreeBlock, EditorProvider } from '@core/journeys/ui'
import { MockedProvider } from '@apollo/client/testing'
import { ThemeProvider } from '../../../../../ThemeProvider'
import { GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock } from '../../../../../../../__generated__/GetJourney'
import { Drawer } from '../../../../Drawer'
import { RadioOption } from '.'

describe('RadioOption Attribute', () => {
  it('shows default attributes', async () => {
    const block: TreeBlock<RadioOptionBlock> = {
      id: 'radioOption1.id',
      __typename: 'RadioOptionBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      label: 'Radio Option',
      action: null,
      children: []
    }
    const { getByRole } = render(<RadioOption {...block} />)
    await waitFor(() =>
      expect(getByRole('button', { name: 'Action None' })).toBeInTheDocument()
    )
  })

  it('shows filled attributes', async () => {
    const block: TreeBlock<RadioOptionBlock> = {
      id: 'radioOption1.id',
      __typename: 'RadioOptionBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      label: 'Radio Option',
      action: {
        __typename: 'NavigateToBlockAction',
        parentBlockId: 'radioOption1.id',
        gtmEventName: 'navigateToBlock',
        blockId: 'step2.id'
      },
      children: []
    }

    const { getByRole } = render(<RadioOption {...block} />)
    await waitFor(() =>
      expect(
        getByRole('button', { name: 'Action Selected Card' })
      ).toBeInTheDocument()
    )
  })

  it('clicking on action attribute shows the action edit drawer', async () => {
    const block: TreeBlock<RadioOptionBlock> = {
      id: 'radioOption1.id',
      __typename: 'RadioOptionBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      label: 'Radio Option',
      action: {
        __typename: 'NavigateToBlockAction',
        parentBlockId: 'radioOption1.id',
        gtmEventName: 'navigateToBlock',
        blockId: 'step2.id'
      },
      children: []
    }
    const { getByTestId, getByRole } = render(
      <MockedProvider>
        <ThemeProvider>
          <EditorProvider>
            <Drawer />
            <RadioOption {...block} />
          </EditorProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Action Selected Card' }))
    await waitFor(() =>
      expect(getByTestId('drawer-title')).toHaveTextContent('Action')
    )
  })
})
