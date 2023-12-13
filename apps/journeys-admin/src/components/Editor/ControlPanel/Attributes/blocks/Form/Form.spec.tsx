import { Form as FormiumFormType } from '@formium/types'
import { render } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveFab,
  ActiveJourneyEditContent,
  ActiveTab,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import {
  GetJourney_journey_blocks_FormBlock_action as FormAction,
  GetJourney_journey_blocks_FormBlock as FormBlock
} from '../../../../../../../__generated__/GetJourney'
import { Action } from '../../Action'

import { Form } from '.'

jest.mock('@core/journeys/ui/EditorProvider', () => {
  const originalModule = jest.requireActual('@core/journeys/ui/EditorProvider')
  return {
    __esModule: true,
    ...originalModule,
    useEditor: jest.fn()
  }
})

const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>

describe('Form', () => {
  const block: TreeBlock<FormBlock> = {
    id: 'formBlock.id',
    __typename: 'FormBlock',
    parentBlockId: 'step0.id',
    parentOrder: 0,
    form: null,
    action: null,
    children: []
  }

  const state: EditorState = {
    steps: [],
    drawerMobileOpen: false,
    activeTab: ActiveTab.Journey,
    activeFab: ActiveFab.Add,
    journeyEditContentComponent: ActiveJourneyEditContent.Canvas
  }

  beforeEach(() => {
    mockUseEditor.mockReturnValue({
      state,
      dispatch: jest.fn()
    })
  })

  it('should show default values', () => {
    const { getByRole } = render(<Form {...block} />)

    expect(getByRole('button', { name: 'Action None' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Credentials Incomplete' })
    ).toBeInTheDocument()
  })

  it('should show filled values', () => {
    const form = {
      id: 'formiumForm.id',
      name: 'form name'
    } as unknown as FormiumFormType
    const action: FormAction = {
      __typename: 'NavigateToBlockAction',
      parentBlockId: 'formBlock.id',
      gtmEventName: 'navigateToBlock',
      blockId: 'step1.id'
    }

    const filledBlock = {
      ...block,
      form,
      action
    }

    const { getByRole } = render(<Form {...filledBlock} />)

    expect(
      getByRole('button', { name: 'Action Selected Card' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Credentials Complete' })
    ).toBeInTheDocument()
  })

  it('should properties tab for Form', () => {
    const dispatch = jest.fn()
    mockUseEditor.mockReturnValue({
      state,
      dispatch
    })
    render(<Form {...block} />)

    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetSelectedAttributeIdAction',
      id: 'formBlock.id-form-action'
    })
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetDrawerPropsAction',
      title: 'Action',
      children: <Action />
    })
  })
})
