import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveFab,
  ActiveJourneyEditContent,
  ActiveTab,
  EditorProvider,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock } from '../../../../../../../__generated__/GetJourney'
import { ThemeProvider } from '../../../../../ThemeProvider'
import { Drawer } from '../../../../Drawer'
import { Action } from '../../Action'

import { RadioOption } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('@core/journeys/ui/EditorProvider', () => {
  const originalModule = jest.requireActual('@core/journeys/ui/EditorProvider')
  return {
    __esModule: true,
    ...originalModule,
    useEditor: jest.fn()
  }
})

const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>

describe('RadioOption Attribute', () => {
  const block: TreeBlock<RadioOptionBlock> = {
    id: 'radioOption1.id',
    __typename: 'RadioOptionBlock',
    parentBlockId: 'step1.id',
    parentOrder: 0,
    label: 'Radio Option',
    action: null,
    children: []
  }
  const state: EditorState = {
    steps: [],
    drawerMobileOpen: false,
    activeTab: ActiveTab.Properties,
    activeFab: ActiveFab.Add,
    journeyEditContentComponent: ActiveJourneyEditContent.Canvas
  }

  beforeEach(() => {
    mockUseEditor.mockReturnValue({
      state,
      dispatch: jest.fn()
    })
  })

  it('shows default attributes', async () => {
    const { getByRole } = render(<RadioOption {...block} />)
    await waitFor(() =>
      expect(getByRole('button', { name: 'Action None' })).toBeInTheDocument()
    )
  })

  it('shows filled attributes', async () => {
    const radioOptionBlock: TreeBlock<RadioOptionBlock> = {
      ...block,
      action: {
        __typename: 'NavigateToBlockAction',
        parentBlockId: 'radioOption1.id',
        gtmEventName: 'navigateToBlock',
        blockId: 'step2.id'
      }
    }
    const { getByRole } = render(<RadioOption {...radioOptionBlock} />)
    await waitFor(() =>
      expect(
        getByRole('button', { name: 'Action Selected Card' })
      ).toBeInTheDocument()
    )
  })

  it('clicking on action attribute shows the action edit drawer', async () => {
    const radioOptionBlock: TreeBlock<RadioOptionBlock> = {
      ...block,
      action: {
        __typename: 'NavigateToBlockAction',
        parentBlockId: 'radioOption1.id',
        gtmEventName: 'navigateToBlock',
        blockId: 'step2.id'
      }
    }
    const { getByTestId, getByRole, getAllByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <EditorProvider>
            <Drawer />
            <RadioOption {...radioOptionBlock} />
          </EditorProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Action Selected Card' }))
    await waitFor(() => expect(getByTestId('drawer-title')).toBeInTheDocument())
    expect(getAllByText('Action')).toHaveLength(2)
  })

  it('should open property drawer for variant', () => {
    const dispatch = jest.fn()
    mockUseEditor.mockReturnValue({
      state,
      dispatch
    })
    render(<RadioOption {...block} />)
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetSelectedAttributeIdAction',
      id: 'radioOption1.id-radio-option-action'
    })
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetDrawerPropsAction',
      title: 'Action',
      children: <Action />
    })
  })
})
