import { render } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveFab,
  ActiveJourneyEditContent,
  ActiveTab,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { GetJourney_journey_blocks_TypographyBlock as TypographyBlock } from '../../../../../../../__generated__/GetJourney'
import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../../../../../__generated__/globalTypes'

import { Variant } from './Variant'

import { Typography } from '.'

jest.mock('@core/journeys/ui/EditorProvider', () => {
  const originalModule = jest.requireActual('@core/journeys/ui/EditorProvider')
  return {
    __esModule: true,
    ...originalModule,
    useEditor: jest.fn()
  }
})

const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>

describe('Typography properties', () => {
  const block: TreeBlock<TypographyBlock> = {
    id: 'typography1.id',
    __typename: 'TypographyBlock',
    parentBlockId: null,
    parentOrder: 0,
    align: null,
    color: null,
    content: 'Typography',
    variant: null,
    children: []
  }
  const state = {
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

  it('shows default attributes', () => {
    const { getByRole } = render(<Typography {...block} />)
    expect(
      getByRole('button', { name: 'Text Variant Body 2' })
    ).toBeInTheDocument()
    expect(getByRole('button', { name: 'Color Primary' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Text Alignment Left' })
    ).toBeInTheDocument()
  })

  it('shows filled attributes', () => {
    const block: TreeBlock<TypographyBlock> = {
      id: 'typography1.id',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      parentOrder: 0,
      align: TypographyAlign.center,
      color: TypographyColor.secondary,
      content: 'Typography',
      variant: TypographyVariant.h2,
      children: []
    }
    const { getByRole } = render(<Typography {...block} />)
    expect(
      getByRole('button', { name: 'Text Variant Header 2' })
    ).toBeInTheDocument()
    expect(getByRole('button', { name: 'Color Secondary' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Text Alignment Center' })
    ).toBeInTheDocument()
  })

  it('should open property drawr for variant', () => {
    const dispatch = jest.fn()
    mockUseEditor.mockReturnValue({
      state,
      dispatch
    })
    render(<Typography {...block} />)
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetSelectedAttributeIdAction',
      id: 'typography1.id-typography-variant'
    })
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetDrawerPropsAction',
      title: 'Text Variant',
      children: <Variant />
    })
  })
})
