import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveFab,
  ActiveJourneyEditContent,
  ActiveTab,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../../__generated__/GetJourney'
import { TestEditorState } from '../../../../../../libs/TestEditorState'

import { Image } from './Image'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

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

  it('should display Image Options', () => {
    const { getByText } = render(<Image {...block} alt={block.alt} />)

    expect(getByText('Image Source')).toBeInTheDocument()
    expect(getByText(block.alt)).toBeInTheDocument()
  })

  it('should open property drawer for variant', async () => {
    const { getByText, getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={state}>
            <Image {...block} alt={block.alt} />
            <TestEditorState renderChildren />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(
      getByText('selectedAttributeId: image1.id-image-options')
    ).toBeInTheDocument()
    expect(getByText('drawerMobileOpen: true')).toBeInTheDocument()
    expect(getByText('drawerTitle: Image')).toBeInTheDocument()
    await waitFor(() =>
      expect(getByTestId('ImageBlockEditor')).toBeInTheDocument()
    )
  })
})
