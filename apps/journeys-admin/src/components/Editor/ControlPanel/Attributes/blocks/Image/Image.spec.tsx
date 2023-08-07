import { render } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveFab,
  ActiveJourneyEditContent,
  ActiveTab,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../../__generated__/GetJourney'

import { Image } from './Image'
import { ImageOptions } from './Options/ImageOptions'

jest.mock('@core/journeys/ui/EditorProvider', () => {
  const originalModule = jest.requireActual('@core/journeys/ui/EditorProvider')
  return {
    __esModule: true,
    ...originalModule,
    useEditor: jest.fn()
  }
})

const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>

describe('Image', () => {
  const block: TreeBlock<ImageBlock> = {
    id: 'image1.id',
    __typename: 'ImageBlock',
    parentBlockId: 'card.id',
    parentOrder: 0,
    src: 'https://example.com/image.jpg',
    alt: 'image.jpg',
    width: 1920,
    height: 1080,
    blurhash: '',
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

  it('should display Image Options', () => {
    const { getByText } = render(<Image {...block} alt={block.alt} />)

    expect(getByText('Image Source')).toBeInTheDocument()
    expect(getByText(block.alt)).toBeInTheDocument()
  })

  it('should open property drawer for variant', () => {
    const dispatch = jest.fn()
    mockUseEditor.mockReturnValue({
      state,
      dispatch
    })
    render(<Image {...block} alt={block.alt} />)
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetSelectedAttributeIdAction',
      id: 'image1.id-image-options'
    })
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetDrawerPropsAction',
      mobileOpen: true,
      title: 'Image',
      children: <ImageOptions />
    })
  })
})
