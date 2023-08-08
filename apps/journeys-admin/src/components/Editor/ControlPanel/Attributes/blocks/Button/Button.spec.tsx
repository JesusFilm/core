import { render } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveFab,
  ActiveJourneyEditContent,
  ActiveTab,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../__generated__/GetJourney'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  IconColor,
  IconName,
  IconSize
} from '../../../../../../../__generated__/globalTypes'
import { Action } from '../../Action'

import { Button } from '.'

jest.mock('@core/journeys/ui/EditorProvider', () => {
  const originalModule = jest.requireActual('@core/journeys/ui/EditorProvider')
  return {
    __esModule: true,
    ...originalModule,
    useEditor: jest.fn()
  }
})

const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>

describe('Button attributes', () => {
  const block: TreeBlock<ButtonBlock> = {
    id: 'button.id',
    __typename: 'ButtonBlock',
    parentBlockId: 'step1.id',
    parentOrder: 0,
    label: 'Button',
    buttonVariant: null,
    buttonColor: null,
    size: null,
    startIconId: null,
    endIconId: null,
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

  it('shows default button', () => {
    const { getByRole } = render(<Button {...block} />)
    expect(getByRole('button', { name: 'Action None' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Color Primary' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Button Size Medium' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Variant Contained' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Leading Icon None' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Trailing Icon None' })
    ).toBeInTheDocument()
  })

  it('shows filled button', () => {
    const filledBlock: TreeBlock<ButtonBlock> = {
      ...block,
      buttonVariant: ButtonVariant.text,
      buttonColor: ButtonColor.secondary,
      size: ButtonSize.large,
      startIconId: 'icon1',
      endIconId: 'icon2',
      action: {
        __typename: 'NavigateToBlockAction',
        parentBlockId: 'button.id',
        gtmEventName: 'navigateToBlock',
        blockId: 'step2.id'
      },
      children: [
        {
          id: 'icon1',
          __typename: 'IconBlock',
          parentBlockId: 'button',
          parentOrder: 0,
          iconName: IconName.ChatBubbleOutlineRounded,
          iconColor: IconColor.secondary,
          iconSize: IconSize.lg,
          children: []
        },
        {
          id: 'icon2',
          __typename: 'IconBlock',
          parentBlockId: 'button',
          parentOrder: 1,
          iconName: IconName.ChevronRightRounded,
          iconColor: IconColor.secondary,
          iconSize: IconSize.lg,
          children: []
        }
      ]
    }
    const { getByRole } = render(<Button {...filledBlock} />)
    expect(
      getByRole('button', { name: 'Action Selected Card' })
    ).toBeInTheDocument()
    expect(getByRole('button', { name: 'Color Secondary' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Button Size Large' })
    ).toBeInTheDocument()
    expect(getByRole('button', { name: 'Variant Text' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Leading Icon Chat Bubble' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Trailing Icon Chevron Right' })
    ).toBeInTheDocument()
  })

  it('should open property drawer for action', () => {
    const dispatch = jest.fn()
    mockUseEditor.mockReturnValue({
      state,
      dispatch
    })
    render(<Button {...block} />)
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetSelectedAttributeIdAction',
      id: 'button.id-button-action'
    })
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetDrawerPropsAction',
      title: 'Action',
      children: <Action />
    })
  })
})
