import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../__generated__/BlockFields'
import { TestEditorState } from '../../../../../../../../libs/TestEditorState'

import { Image } from './Image'

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
    children: [],
    scale: null
  }

  it('should display Image Options', () => {
    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider>
            <Image {...block} alt={block.alt} />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByText('Image Source')).toBeInTheDocument()
    expect(getByText(block.alt)).toBeInTheDocument()
  })

  it('image options accordion should be open', async () => {
    const { getByText, getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider>
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
      expect(getByTestId('ImageBlockHeader')).toBeInTheDocument()
    )
  })
})
