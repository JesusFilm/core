import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../__generated__/BlockFields'
import { TestEditorState } from '../../../../../../../../libs/TestEditorState'

import { FocalPoint } from './FocalPoint'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

describe('FocalPoint', () => {
  const imageBlock: ImageBlock = {
    id: 'image1.id',
    __typename: 'ImageBlock',
    src: 'https://example.com/image.jpg',
    alt: 'image.jpg',
    width: 1920,
    height: 1080,
    blurhash: '',
    focalLeft: 50,
    focalTop: 50
  }

  const mockUpdateImageBlock = jest.fn()

  const renderComponent = () =>
    render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider>
            <FocalPoint
              imageBlock={imageBlock}
              updateImageBlock={mockUpdateImageBlock}
            />
            <TestEditorState />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

  it('should display Focal Point title', () => {
    const { getByText } = renderComponent()
    expect(getByText('Focal Point')).toBeInTheDocument()
  })

  it('should display image and focal point', () => {
    const { getByAltText, getByRole } = renderComponent()
    expect(getByAltText('image.jpg')).toBeInTheDocument()
    expect(getByRole('button')).toBeInTheDocument() // focal point dot
  })

  it('should display input fields for Left and Top', () => {
    const { getByLabelText } = renderComponent()
    expect(getByLabelText('Left')).toBeInTheDocument()
    expect(getByLabelText('Top')).toBeInTheDocument()
  })

  it('should update focal point on image click', async () => {
    const { getByRole } = renderComponent()
    const image = getByRole('img')

    fireEvent.click(image, { clientX: 100, clientY: 100 })

    await waitFor(() => {
      expect(mockUpdateImageBlock).toHaveBeenCalledWith(
        expect.objectContaining({
          focalLeft: expect.any(Number),
          focalTop: expect.any(Number)
        })
      )
    })
  })

  it('should update focal point on input change', async () => {
    const { getByLabelText } = renderComponent()
    const leftInput = getByLabelText('Left')

    fireEvent.change(leftInput, { target: { value: '75' } })
    fireEvent.blur(leftInput)

    await waitFor(() => {
      expect(mockUpdateImageBlock).toHaveBeenCalledWith(
        expect.objectContaining({
          focalLeft: 75,
          focalTop: 50
        })
      )
    })
  })

  it('should not allow values outside 0-100 range', async () => {
    const { getByLabelText } = renderComponent()
    const topInput = getByLabelText('Top')

    fireEvent.change(topInput, { target: { value: '150' } })
    fireEvent.blur(topInput)

    await waitFor(() => {
      expect(mockUpdateImageBlock).toHaveBeenCalledWith(
        expect.objectContaining({
          focalLeft: 50,
          focalTop: 100
        })
      )
    })
  })
})
