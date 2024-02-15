import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveContent,
  ActiveFab,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'
import { ActiveSlide } from '@core/journeys/ui/EditorProvider/EditorProvider'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../__generated__/BlockFields'
import { TestEditorState } from '../../../../../../../libs/TestEditorState'

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
    activeFab: ActiveFab.Add,
    activeSlide: ActiveSlide.JourneyFlow,
    activeContent: ActiveContent.Canvas
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
            <TestEditorState />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(
      getByText('selectedAttributeId: image1.id-image-options')
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(getByTestId('ImageBlockEditor')).toBeInTheDocument()
    )
  })
})
