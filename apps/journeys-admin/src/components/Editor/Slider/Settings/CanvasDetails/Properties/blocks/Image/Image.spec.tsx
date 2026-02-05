import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../__generated__/BlockFields'
import { JourneyFields } from '../../../../../../../../../__generated__/JourneyFields'
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
    scale: null,
    focalLeft: 50,
    focalTop: 50,
    customizable: null
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

  it('should not render BlockCustomizationToggle when journey is not a template', () => {
    render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <EditorProvider initialState={{ selectedBlock: block }}>
            <Image {...block} alt={block.alt} />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.queryByText('Needs Customization')).not.toBeInTheDocument()
  })

  it('should render BlockCustomizationToggle when journey is a template', () => {
    render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { template: true } as unknown as JourneyFields,
              variant: 'admin'
            }}
          >
            <CommandProvider>
              <EditorProvider initialState={{ selectedBlock: block }}>
                <Image {...block} alt={block.alt} />
              </EditorProvider>
            </CommandProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Needs Customization')).toBeInTheDocument()
  })
})
